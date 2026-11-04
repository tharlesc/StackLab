/**
 * Milestone 1 Challenger Empirical Verification Harness
 * 
 * Verifies:
 * 1. Absence of use*.ts in client/src/screens/
 * 2. Presence of exactly 10 hooks + index.ts in client/src/hooks/
 * 3. Static AST analysis of exported symbols from client/src/hooks/index.ts and submodules
 * 4. Static AST analysis of import resolution in all 10 screen views (0 missing identifiers)
 * 5. Screen index.ts cleanup (0 relative hook re-exports)
 * 6. Programmatic TypeScript compiler check verifying @/hooks resolution and diagnostics
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('../client/node_modules/typescript');

const ROOT_DIR = path.resolve('.');
const CLIENT_DIR = path.join(ROOT_DIR, 'client');
const SCREENS_DIR = path.join(CLIENT_DIR, 'src', 'screens');
const HOOKS_DIR = path.join(CLIENT_DIR, 'src', 'hooks');

const EXPECTED_HOOKS = [
  'useAdminScreen',
  'useDashboardHome',
  'useInbox',
  'useLogin',
  'useNewRDO',
  'useNotifications',
  'useProfile',
  'useRDOReview',
  'useSettings',
  'useSyncQueue',
];

const EXPECTED_AUXILIARY = [
  'WORKS_PER_PAGE',
  'STEPS',
  'AdminTab',
  'DashboardTab',
  'InboxFilter',
  'NotificationFilter',
];

const EXPECTED_VIEW_HOOK_MAP = {
  'DashboardHome/DashboardHomeView.tsx': ['useDashboardHome'],
  'Login/LoginView.tsx': ['useLogin'],
  'NewRDO/NewRDOView.tsx': ['useNewRDO', 'STEPS'],
  'Notifications/NotificationsView.tsx': ['useNotifications', 'NotificationFilter'],
  'Profile/ProfileView.tsx': ['useProfile'],
  'Settings/SettingsView.tsx': ['useSettings'],
  'SyncQueue/SyncQueueView.tsx': ['useSyncQueue'],
  'master/Admin/AdminView.tsx': ['useAdminScreen', 'AdminTab'],
  'master/Inbox/InboxView.tsx': ['useInbox', 'InboxFilter'],
  'master/RDOReview/RDOReviewView.tsx': ['useRDOReview'],
};

function getAllFiles(dir, predicate) {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(getAllFiles(full, predicate));
    } else if (!predicate || predicate(entry.name, full)) {
      results.push(full);
    }
  }
  return results;
}

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedChecks++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('================================================================================');
console.log('🔬 MILESTONE 1 CHALLENGER EMPIRICAL VERIFICATION');
console.log(`   Client Directory: ${CLIENT_DIR}`);
console.log(`   Node Version:     ${process.version}`);
console.log(`   TypeScript:       ${ts.version}`);
console.log('================================================================================\n');

// -----------------------------------------------------------------------------
// CHECK 1: Verify no use*.ts files remain in client/src/screens/
// -----------------------------------------------------------------------------
console.log('▶ [CHECK 1] Scanning client/src/screens/ for residual hook files...');
const residualHookFiles = getAllFiles(SCREENS_DIR, (name) => /^use.*\.tsx?$/.test(name));
assert(
  residualHookFiles.length === 0,
  `Zero use*.ts / use*.tsx files in client/src/screens/ (Found: ${residualHookFiles.length})`
);
if (residualHookFiles.length > 0) {
  console.error('    Residual files:', residualHookFiles);
}

// Check for relative hook imports in screens
const screenSourceFiles = getAllFiles(SCREENS_DIR, (name) => /\.(ts|tsx)$/.test(name));
let relativeHookImports = [];
for (const file of screenSourceFiles) {
  const content = fs.readFileSync(file, 'utf8');
  if (/\b(?:import|export)\b.*?['"]\.\.?\/.*?use/i.test(content)) {
    relativeHookImports.push(file);
  }
}
assert(
  relativeHookImports.length === 0,
  `Zero relative hook imports (./use...) in client/src/screens/ (Found: ${relativeHookImports.length})`
);

// -----------------------------------------------------------------------------
// CHECK 2: Verify client/src/hooks/ directory and file structure
// -----------------------------------------------------------------------------
console.log('\n▶ [CHECK 2] Verifying client/src/hooks/ directory inventory...');
assert(fs.existsSync(HOOKS_DIR), 'Directory client/src/hooks/ exists');

const hookDirEntries = fs.readdirSync(HOOKS_DIR).sort();
const expectedFiles = [
  'index.ts',
  'useAdminScreen.ts',
  'useDashboardHome.ts',
  'useInbox.ts',
  'useLogin.ts',
  'useNewRDO.ts',
  'useNotifications.ts',
  'useProfile.ts',
  'useRDOReview.ts',
  'useSettings.ts',
  'useSyncQueue.ts',
].sort();

assert(
  JSON.stringify(hookDirEntries) === JSON.stringify(expectedFiles),
  `client/src/hooks/ contains exactly 10 hook files + 1 index.ts (Found: ${hookDirEntries.length} entries)`
);

// -----------------------------------------------------------------------------
// CHECK 3: Static AST Analysis of Hook Exports
// -----------------------------------------------------------------------------
console.log('\n▶ [CHECK 3] Static AST analysis of client/src/hooks/ exports...');
const exportedSymbols = new Set();
const hookModuleExports = new Map();

for (const hookFile of expectedFiles) {
  const filePath = path.join(HOOKS_DIR, hookFile);
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    hookFile,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  const fileExports = new Set();

  function visit(node) {
    // export const / function / type / enum / class ...
    if (ts.isExportDeclaration(node)) {
      if (node.exportClause && ts.isNamedExports(node.exportClause)) {
        for (const element of node.exportClause.elements) {
          fileExports.add(element.name.text);
        }
      }
    } else if (
      node.modifiers &&
      node.modifiers.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        fileExports.add(node.name.text);
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (ts.isIdentifier(decl.name)) {
            fileExports.add(decl.name.text);
          }
        }
      } else if (ts.isTypeAliasDeclaration(node) && node.name) {
        fileExports.add(node.name.text);
      } else if (ts.isInterfaceDeclaration(node) && node.name) {
        fileExports.add(node.name.text);
      } else if (ts.isEnumDeclaration(node) && node.name) {
        fileExports.add(node.name.text);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  hookModuleExports.set(hookFile, fileExports);
  for (const exp of fileExports) {
    exportedSymbols.add(exp);
  }
}

// Verify index.ts re-exports all 10 modules
const indexContent = fs.readFileSync(path.join(HOOKS_DIR, 'index.ts'), 'utf8');
for (const hook of EXPECTED_HOOKS) {
  const reExportRegex = new RegExp(`export\\s+\\*\\s+from\\s+['"]\\.\\/${hook}['"]`);
  assert(
    reExportRegex.test(indexContent),
    `client/src/hooks/index.ts re-exports from './${hook}'`
  );
}

// Verify all 10 hook functions exist in exported set
for (const hook of EXPECTED_HOOKS) {
  assert(exportedSymbols.has(hook), `Hook function '${hook}' is exported`);
}

// Verify auxiliary exports
for (const aux of EXPECTED_AUXILIARY) {
  assert(exportedSymbols.has(aux), `Auxiliary export '${aux}' is exported`);
}

// -----------------------------------------------------------------------------
// CHECK 4: Verify Screen Views Import Resolution from @/hooks
// -----------------------------------------------------------------------------
console.log('\n▶ [CHECK 4] Verifying all 10 views in client/src/screens/ resolve imports from @/hooks...');

for (const [relViewPath, expectedImports] of Object.entries(EXPECTED_VIEW_HOOK_MAP)) {
  const fullViewPath = path.join(SCREENS_DIR, relViewPath);
  assert(fs.existsSync(fullViewPath), `View exists: ${relViewPath}`);

  const sourceText = fs.readFileSync(fullViewPath, 'utf8');
  const sourceFile = ts.createSourceFile(
    relViewPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true
  );

  const importedFromHooks = new Set();

  function visitImport(node) {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.text;
      if (moduleSpecifier === '@/hooks') {
        if (node.importClause && node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
          for (const el of node.importClause.namedBindings.elements) {
            importedFromHooks.add(el.name.text);
          }
        }
      }
    }
    ts.forEachChild(node, visitImport);
  }

  visitImport(sourceFile);

  // Check expected imports are present
  for (const expected of expectedImports) {
    assert(
      importedFromHooks.has(expected),
      `${relViewPath} imports '${expected}' from '@/hooks'`
    );
  }

  // Check all symbols imported from '@/hooks' actually exist
  for (const imported of importedFromHooks) {
    assert(
      exportedSymbols.has(imported),
      `${relViewPath} imported identifier '${imported}' resolves to exported symbol in @/hooks (0 missing identifiers)`
    );
  }
}

// -----------------------------------------------------------------------------
// CHECK 5: Programmatic TypeScript Typecheck & Resolution of @/hooks
// -----------------------------------------------------------------------------
console.log('\n▶ [CHECK 5] TypeScript Compiler Typecheck & Diagnostic Verification...');

const tsconfigPath = path.join(CLIENT_DIR, 'tsconfig.json');
const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
const parsedConfig = ts.parseJsonConfigFileContent(
  configFile.config,
  ts.sys,
  CLIENT_DIR
);

// Synthetic probe source code testing both static and dynamic imports of @/hooks
const probeSourceCode = `
import {
  useDashboardHome,
  WORKS_PER_PAGE,
  DashboardTab,
  useLogin,
  useNewRDO,
  STEPS,
  useNotifications,
  NotificationFilter,
  useProfile,
  useSettings,
  useSyncQueue,
  useAdminScreen,
  AdminTab,
  useInbox,
  InboxFilter,
  useRDOReview,
} from '@/hooks';

// Type checks with valid union literals
const _worksPerPage: number = WORKS_PER_PAGE;
const _stepsCount: number = STEPS.length;
let _dTab: DashboardTab = 'Obras';
let _nFilter: NotificationFilter = 'todas';
let _aTab: AdminTab = 'obras';
let _iFilter: InboxFilter = 'todos';

// Dynamic import check
export async function dynamicImportProbe() {
  const dynamicHooks = await import('@/hooks');
  return {
    dashboard: dynamicHooks.useDashboardHome,
    login: dynamicHooks.useLogin,
    newRDO: dynamicHooks.useNewRDO,
    notifications: dynamicHooks.useNotifications,
    profile: dynamicHooks.useProfile,
    settings: dynamicHooks.useSettings,
    syncQueue: dynamicHooks.useSyncQueue,
    admin: dynamicHooks.useAdminScreen,
    inbox: dynamicHooks.useInbox,
    rdoReview: dynamicHooks.useRDOReview,
    worksPerPage: dynamicHooks.WORKS_PER_PAGE,
    steps: dynamicHooks.STEPS,
  };
}
`;

const probeFilePath = path.join(CLIENT_DIR, 'src', '__probe_hooks_typecheck.ts');
fs.writeFileSync(probeFilePath, probeSourceCode, 'utf8');

try {
  const rootNames = [...parsedConfig.fileNames, probeFilePath];
  const program = ts.createProgram({
    rootNames,
    options: {
      ...parsedConfig.options,
      noEmit: true,
      skipLibCheck: true,
    },
  });

  const diagnostics = ts.getPreEmitDiagnostics(program);
  const probeDiagnostics = diagnostics.filter(
    (d) => d.file && d.file.fileName.includes('__probe_hooks_typecheck')
  );

  assert(
    probeDiagnostics.length === 0,
    `Programmatic TypeScript compile probe has 0 errors (Diagnostics: ${probeDiagnostics.length})`
  );

  if (probeDiagnostics.length > 0) {
    for (const d of probeDiagnostics) {
      const message = ts.flattenDiagnosticMessageText(d.messageText, '\n');
      console.error(`    Diagnostic: ${message}`);
    }
  }
} finally {
  if (fs.existsSync(probeFilePath)) {
    fs.unlinkSync(probeFilePath);
  }
}

// -----------------------------------------------------------------------------
// SUMMARY REPORT
// -----------------------------------------------------------------------------
console.log('\n================================================================================');
console.log('📊 CHALLENGER EMPIRICAL VERIFICATION REPORT');
console.log('================================================================================');
console.log(`TOTAL CHECKS: ${totalChecks}`);
console.log(`PASSED:       ${passedChecks}`);
console.log(`FAILED:       ${failedChecks}`);
console.log('================================================================================');

if (failedChecks === 0) {
  console.log('🎉 VERDICT: APPROVE — ALL CHALLENGER HARNESS CHECKS PASSED 100%');
  process.exit(0);
} else {
  console.error('❌ VERDICT: REJECT — CHALLENGER HARNESS IDENTIFIED FAILURES');
  process.exit(1);
}
