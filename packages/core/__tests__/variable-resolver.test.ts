import { describe, it, expect } from 'vitest';
import { VariableResolver } from '../src/variable-resolver';
import {
  FileStrategy,
  RelativeFileStrategy,
  FileBasenameStrategy,
  FileBasenameNoExtStrategy,
  FileDirnameStrategy,
  WorkspaceFolderStrategy,
  CwdStrategy,
} from '../src/variable-resolver/strategies';

const context = {
  fileAbsolutePath: '/Users/dev/project/src/app.test.js',
  workspaceRootPath: '/Users/dev/project',
  cwd: '/Users/dev/project',
};

function createResolver() {
  const resolver = new VariableResolver();
  resolver.register(new FileStrategy());
  resolver.register(new RelativeFileStrategy());
  resolver.register(new FileBasenameStrategy());
  resolver.register(new FileBasenameNoExtStrategy());
  resolver.register(new FileDirnameStrategy());
  resolver.register(new WorkspaceFolderStrategy());
  resolver.register(new CwdStrategy());
  return resolver;
}

describe('VariableResolver', () => {
  it('resolves ${file} to absolute file path', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo ${file}', context);
    expect(result).toBe('echo /Users/dev/project/src/app.test.js');
  });

  it('resolves ${relativeFile} to path relative to workspace root', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo ${relativeFile}', context);
    expect(result).toBe('echo src/app.test.js');
  });

  it('resolves ${fileBasename} to filename with extension', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo ${fileBasename}', context);
    expect(result).toBe('echo app.test.js');
  });

  it('resolves ${fileBasenameNoExtension} to filename without extension', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo ${fileBasenameNoExtension}', context);
    expect(result).toBe('echo app.test');
  });

  it('resolves ${fileDirname} to directory of file', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo ${fileDirname}', context);
    expect(result).toBe('echo /Users/dev/project/src');
  });

  it('resolves ${workspaceFolder} to workspace root path', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo ${workspaceFolder}', context);
    expect(result).toBe('echo /Users/dev/project');
  });

  it('resolves ${cwd} to current working directory', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo ${cwd}', context);
    expect(result).toBe('echo /Users/dev/project');
  });

  it('resolves multiple variables in one command', () => {
    const resolver = createResolver();
    const result = resolver.resolve('${file} --dir ${fileDirname}', context);
    expect(result).toBe('/Users/dev/project/src/app.test.js --dir /Users/dev/project/src');
  });

  it('auto-appends ${relativeFile} when no variables present', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo hello', context);
    expect(result).toBe('echo hello src/app.test.js');
  });

  it('does not auto-append relativeFile when variables are present', () => {
    const resolver = createResolver();
    const result = resolver.resolve('echo ${file}', context);
    expect(result).toBe('echo /Users/dev/project/src/app.test.js');
    expect(result).not.toContain('src/app.test.js --');
  });
});

describe('VariableResolver default behavior', () => {
  it('auto-appends ${relativeFile} when no variables in command', () => {
    const resolver = createResolver();
    const result = resolver.resolve('npm run build', context);
    expect(result).toBe('npm run build src/app.test.js');
  });

  it('throws when file path is required but not provided', () => {
    const resolver = createResolver();
    const noFileContext = { workspaceRootPath: '/Users/dev/project', cwd: '/Users/dev/project' };
    expect(() => resolver.resolve('echo ${file}', noFileContext)).toThrow('No active file');
  });

  it('auto-appends correct relative path when workspace root is prefix substring', () => {
    const resolver = createResolver();
    const edgeContext = {
      fileAbsolutePath: '/Users/dev/project-old/file.txt',
      workspaceRootPath: '/Users/dev/project',
      cwd: '/Users/dev/project',
    };
    const result = resolver.resolve('echo', edgeContext);
    expect(result).toBe('echo ../project-old/file.txt');
  });
});
