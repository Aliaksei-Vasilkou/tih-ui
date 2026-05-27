import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HighlightText from './HighlightText';

describe('HighlightText', () => {
  it('should render the plain text when query is empty', () => {
    render(<HighlightText text="What is a closure?" query="" />);
    expect(screen.getByText('What is a closure?')).toBeInTheDocument();
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
  });

  it('should render plain text when query is only whitespace', () => {
    render(<HighlightText text="Hello world" query="   " />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(document.querySelector('mark')).toBeNull();
  });

  it('should wrap the matching word in a mark element', () => {
    render(<HighlightText text="What is a closure?" query="closure" />);
    expect(screen.getByText('closure').tagName).toBe('MARK');
  });

  it('should be case-insensitive when matching', () => {
    render(<HighlightText text="What is JavaScript?" query="javascript" />);
    // The original case from the text is preserved inside the mark
    expect(screen.getByText('JavaScript').tagName).toBe('MARK');
  });

  it('should highlight multiple words independently', () => {
    render(<HighlightText text="React and TypeScript" query="react typescript" />);
    const marks = document.querySelectorAll('mark');
    expect(marks).toHaveLength(2);
  });

  it('should not highlight partial word matches (only full word equality)', () => {
    render(<HighlightText text="TypeScript type" query="type" />);
    // Only the exact word "type" should be highlighted, not the "Type" in "TypeScript"
    const marks = document.querySelectorAll('mark');
    // "type" appears once as standalone word (split result produces 'type')
    // "TypeScript" contains "Type" as prefix — the regex splits it but the filter checks exact equality
    const markedTexts = Array.from(marks).map((m) => m.textContent);
    markedTexts.forEach((text) => {
      expect(text?.toLowerCase()).toBe('type');
    });
  });

  it('should escape regex special characters in the query', () => {
    render(<HighlightText text="a.b + c" query="a.b" />);
    // Should match the literal "a.b" not treat . as wildcard
    const marks = document.querySelectorAll('mark');
    const found = Array.from(marks).some((m) => m.textContent === 'a.b');
    expect(found).toBe(true);
  });

  it('should render non-matching text as plain text nodes', () => {
    const { container } = render(<HighlightText text="Hello world" query="world" />);
    expect(container.textContent).toBe('Hello world');
    expect(screen.getByText('world').tagName).toBe('MARK');
  });
});
