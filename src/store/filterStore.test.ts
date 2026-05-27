import { describe, it, expect, afterEach } from 'vitest';
import { act } from '@testing-library/react';
import { useFilterStore } from './filterStore';

afterEach(() => {
  act(() => {
    useFilterStore.setState({
      selectedLanguageId: null,
      selectedCategoryId: null,
    });
  });
});

describe('filterStore', () => {
  it('should have null selections by default', () => {
    const { selectedLanguageId, selectedCategoryId } = useFilterStore.getState();
    expect(selectedLanguageId).toBeNull();
    expect(selectedCategoryId).toBeNull();
  });

  it('should set the selected language id', () => {
    act(() => {
      useFilterStore.getState().setLanguage(42);
    });
    expect(useFilterStore.getState().selectedLanguageId).toBe(42);
  });

  it('should reset selectedCategoryId to null when language changes', () => {
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 1, selectedCategoryId: 5 });
      useFilterStore.getState().setLanguage(2);
    });
    expect(useFilterStore.getState().selectedLanguageId).toBe(2);
    expect(useFilterStore.getState().selectedCategoryId).toBeNull();
  });

  it('should set language to null and keep category null too', () => {
    act(() => {
      useFilterStore.getState().setLanguage(null);
    });
    expect(useFilterStore.getState().selectedLanguageId).toBeNull();
    expect(useFilterStore.getState().selectedCategoryId).toBeNull();
  });

  it('should set the selected category id', () => {
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 1 });
      useFilterStore.getState().setCategory(10);
    });
    expect(useFilterStore.getState().selectedCategoryId).toBe(10);
    // setCategory should NOT change the language
    expect(useFilterStore.getState().selectedLanguageId).toBe(1);
  });

  it('should reset both ids when reset is called', () => {
    act(() => {
      useFilterStore.setState({ selectedLanguageId: 3, selectedCategoryId: 7 });
      useFilterStore.getState().reset();
    });
    expect(useFilterStore.getState().selectedLanguageId).toBeNull();
    expect(useFilterStore.getState().selectedCategoryId).toBeNull();
  });
});
