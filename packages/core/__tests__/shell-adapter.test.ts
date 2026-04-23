import { describe, it, expect } from 'vitest';
import { UnixShellAdapter, WindowsShellAdapter, createShellAdapter } from '../src/shell-adapter';

describe('UnixShellAdapter', () => {
  const adapter = new UnixShellAdapter();

  it('escapes paths with spaces using single quotes', () => {
    expect(adapter.escapePath('/Users/dev/my project/file.txt')).toBe(
      "'/Users/dev/my project/file.txt'"
    );
  });

  it('does not quote paths without spaces', () => {
    expect(adapter.escapePath('/Users/dev/file.txt')).toBe('/Users/dev/file.txt');
  });

  it('returns zsh as default shell', () => {
    expect(adapter.getShell()).toBe('zsh');
  });

  it('returns correct shell args', () => {
    expect(adapter.getShellArgs()).toEqual(['-c']);
  });

  it('returns path with forward slashes', () => {
    expect(adapter.normalizePath('/Users/dev/file.txt')).toBe('/Users/dev/file.txt');
  });

  it('escapes single quotes in path using ANSI-C quoting', () => {
    expect(adapter.escapePath("/Users/dev/it's/file.txt")).toBe("'/Users/dev/it'\\''s/file.txt'");
  });
});

describe('WindowsShellAdapter', () => {
  const adapter = new WindowsShellAdapter();

  it('escapes paths with spaces using double quotes', () => {
    expect(adapter.escapePath('C:\\Users\\dev\\my project\\file.txt')).toBe(
      '"C:\\Users\\dev\\my project\\file.txt"'
    );
  });

  it('does not quote paths without spaces', () => {
    expect(adapter.escapePath('C:\\Users\\dev\\file.txt')).toBe('C:\\Users\\dev\\file.txt');
  });

  it('returns powershell as default shell', () => {
    expect(adapter.getShell()).toBe('powershell');
  });

  it('returns correct shell args', () => {
    expect(adapter.getShellArgs()).toEqual(['-Command']);
  });

  it('escapes double quotes inside path', () => {
    expect(adapter.escapePath('C:\\Users\\"test"\\file.txt')).toBe(
      '"C:\\Users\\`"test`"\\file.txt"'
    );
  });

  it('normalizes path with forward slashes to backslashes', () => {
    expect(adapter.normalizePath('/Users/dev/file.txt')).toBe('\\Users\\dev\\file.txt');
  });
});

describe('createShellAdapter', () => {
  it('returns UnixShellAdapter on non-windows platforms', () => {
    const adapter = createShellAdapter();
    expect(adapter).toBeInstanceOf(UnixShellAdapter);
  });
});
