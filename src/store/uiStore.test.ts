import { describe, it, expect, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useUIStore } from './uiStore';

afterEach(() => {
  act(() => {
    useUIStore.setState({ showUpload: false, showExport: false });
  });
});

describe('uiStore', () => {
  it('should have both panels hidden by default', () => {
    const { showUpload, showExport } = useUIStore.getState();
    expect(showUpload).toBe(false);
    expect(showExport).toBe(false);
  });

  it('should show upload panel when toggleUpload is called', () => {
    act(() => {
      useUIStore.getState().toggleUpload();
    });
    expect(useUIStore.getState().showUpload).toBe(true);
  });

  it('should toggle upload panel off when called again', () => {
    act(() => {
      useUIStore.setState({ showUpload: true });
      useUIStore.getState().toggleUpload();
    });
    expect(useUIStore.getState().showUpload).toBe(false);
  });

  it('should close export panel when upload is toggled on', () => {
    act(() => {
      useUIStore.setState({ showExport: true });
      useUIStore.getState().toggleUpload();
    });
    expect(useUIStore.getState().showUpload).toBe(true);
    expect(useUIStore.getState().showExport).toBe(false);
  });

  it('should show export panel when toggleExport is called', () => {
    act(() => {
      useUIStore.getState().toggleExport();
    });
    expect(useUIStore.getState().showExport).toBe(true);
  });

  it('should toggle export panel off when called again', () => {
    act(() => {
      useUIStore.setState({ showExport: true });
      useUIStore.getState().toggleExport();
    });
    expect(useUIStore.getState().showExport).toBe(false);
  });

  it('should close upload panel when export is toggled on', () => {
    act(() => {
      useUIStore.setState({ showUpload: true });
      useUIStore.getState().toggleExport();
    });
    expect(useUIStore.getState().showExport).toBe(true);
    expect(useUIStore.getState().showUpload).toBe(false);
  });

  it('should set showUpload directly with setShowUpload', () => {
    act(() => {
      useUIStore.getState().setShowUpload(true);
    });
    expect(useUIStore.getState().showUpload).toBe(true);

    act(() => {
      useUIStore.getState().setShowUpload(false);
    });
    expect(useUIStore.getState().showUpload).toBe(false);
  });

  it('should set showExport directly with setShowExport', () => {
    act(() => {
      useUIStore.getState().setShowExport(true);
    });
    expect(useUIStore.getState().showExport).toBe(true);

    act(() => {
      useUIStore.getState().setShowExport(false);
    });
    expect(useUIStore.getState().showExport).toBe(false);
  });
});
