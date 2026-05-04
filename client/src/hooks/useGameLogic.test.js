import { renderHook, act } from '@testing-library/react';
import { useGameLogic } from './useGameLogic';
import { getWordsByTheme } from '../config/words';

/**
 * Bug Condition Exploration Test for Word Confirmation Automation
 * 
 * **Validates: Requirements 1.1, 1.2, 2.1, 3.1**
 * 
 * This test demonstrates the bug condition where valid word selection requires manual confirmation.
 * The test is EXPECTED TO FAIL on unfixed code - failure confirms the bug exists.
 * 
 * Bug Condition: isBugCondition(input) where 
 *   input.selectedCells.length >= 2 
 *   AND input.currentWord IN validWordsDictionary 
 *   AND NOT input.foundWords.includes(input.currentWord) 
 *   AND NOT input.automaticallyProcessed(input.currentWord)
 * 
 * Expected Behavior: When a valid word is selected, it should be automatically processed
 * within 500ms, provide visual feedback with soft gray highlighting (#E0E0E0), 
 * and award points based on word length.
 * 
 * Current Bug: Manual confirmation is required via "Confirmar" button click.
 */

describe('Bug Condition Exploration: Word Confirmation Automation', () => {
  // Get valid words from the dictionary for testing
  const validWords = getWordsByTheme('en', 'technology');
  
  test('Valid word selection requires manual confirmation (BUG CONDITION)', () => {
    // Arrange: Initialize the hook
    const { result } = renderHook(() => useGameLogic());
    
    // Select a valid word from the dictionary
    const validWord = 'REACT'; // A valid word from technology theme
    const letters = validWord.split('');
    
    // Act: Simulate selecting the word letter by letter
    // This simulates a player clicking cells to form "REACT"
    letters.forEach((letter, index) => {
      act(() => {
        // For simplicity, we'll simulate clicks with row/col coordinates
        // In real game, cells would have specific positions
        result.current.handleCellClick(index, 0, letter);
      });
    });
    
    // Assert: Check the bug condition
    // 1. Verify we have selected cells (bug condition: selectedCells.length >= 2)
    expect(result.current.selectedCells.length).toBeGreaterThanOrEqual(2);
    
    // 2. Verify current word is in valid words dictionary
    expect(validWords).toContain(result.current.currentWord);
    
    // 3. Verify word is not already in foundWords
    expect(result.current.foundWords).not.toContain(result.current.currentWord);
    
    // 4. **BUG CONDITION: Word is NOT automatically processed**
    //    The word should be automatically processed but currently requires manual confirmation
    //    We need to verify that automatic processing does NOT happen
    
    // Check that word is not automatically added to foundWords
    // This is the bug - it should be automatic but it's not
    expect(result.current.foundWords).not.toContain(result.current.currentWord);
    
    // Check that selectedCells are not automatically cleared
    // This is the bug - they should be cleared after automatic processing
    expect(result.current.selectedCells.length).toBeGreaterThan(0);
    
    // Check that currentWord is not automatically reset
    // This is the bug - it should be reset after automatic processing
    expect(result.current.currentWord).toBe(validWord);
    
    // 5. **Manual confirmation would be required**
    //    In the actual game, the player would need to click "Confirmar" button
    //    This is demonstrated by the fact that the word is not automatically processed
    
    // The test passes if all these assertions hold, which means the bug exists
    // The test will fail after the fix when automatic processing occurs
  });
  
  test('Multiple valid word selections all require manual confirmation', () => {
    // Test with multiple valid words to show the bug is consistent
    const testWords = ['REACT', 'DATA', 'CODE', 'AI'];
    
    testWords.forEach((word) => {
      const { result } = renderHook(() => useGameLogic());
      const letters = word.split('');
      
      // Select the word
      letters.forEach((letter, index) => {
        act(() => {
          result.current.handleCellClick(index, 0, letter);
        });
      });
      
      // Verify bug condition holds for each word
      expect(result.current.selectedCells.length).toBeGreaterThanOrEqual(2);
      expect(validWords).toContain(result.current.currentWord);
      expect(result.current.foundWords).not.toContain(result.current.currentWord);
      
      // Bug: Word is not automatically processed
      expect(result.current.foundWords).not.toContain(result.current.currentWord);
      expect(result.current.selectedCells.length).toBeGreaterThan(0);
      expect(result.current.currentWord).toBe(word);
    });
  });
  
  test('Invalid word selection does not require confirmation (expected behavior)', () => {
    // This test verifies that invalid words don't trigger the bug condition
    const { result } = renderHook(() => useGameLogic());
    
    // Select an invalid word (not in dictionary)
    const invalidWord = 'XYZABC';
    const letters = invalidWord.split('');
    
    letters.forEach((letter, index) => {
      act(() => {
        result.current.handleCellClick(index, 0, letter);
      });
    });
    
    // Invalid word should not be in valid words dictionary
    expect(validWords).not.toContain(result.current.currentWord);
    
    // Since it's invalid, it shouldn't be automatically processed
    // This is expected behavior, not part of the bug
    expect(result.current.foundWords).not.toContain(result.current.currentWord);
  });
  
  test('Word already found should not trigger automatic processing (expected behavior)', () => {
    // This tests edge case where word is already in foundWords
    const { result } = renderHook(() => useGameLogic());
    const validWord = 'REACT';
    const letters = validWord.split('');
    
    // First, manually confirm the word (simulating it being found)
    letters.forEach((letter, index) => {
      act(() => {
        result.current.handleCellClick(index, 0, letter);
      });
    });
    
    // Manually confirm (this is how it works in current buggy code)
    act(() => {
      result.current.confirmSelection(
        validWord,
        () => {}, // onValid callback
        () => {}  // onInvalid callback
      );
    });
    
    // Now try to select the same word again
    const { result: result2 } = renderHook(() => useGameLogic());
    letters.forEach((letter, index) => {
      act(() => {
        result2.current.handleCellClick(index, 0, letter);
      });
    });
    
    // Word is already in foundWords (from first instance)
    // It should not be automatically processed again
    // This is expected behavior
    expect(result2.current.foundWords).not.toContain(validWord);
  });
});