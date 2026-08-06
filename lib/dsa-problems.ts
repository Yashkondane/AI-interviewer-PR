export const STARTER_TEMPLATES: Record<string, string> = {
    "python": `import sys\ninput_data = sys.stdin.read().split('\\n')\n# Parse input and implement your solution\n# Print the result to stdout`,
    "javascript": `const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');\n// Parse input and implement your solution\n// Use console.log() to print the result`,
    "java": `import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(String.join("\\n", java.nio.file.Files.readAllLines(java.nio.file.Paths.get("/dev/stdin"))));\n        // Parse input and implement your solution\n        // Use System.out.println() to print the result\n    }\n}`,
    "cpp": `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // Read input from stdin\n    // Implement your solution\n    // Print the result to stdout\n    return 0;\n}`
}

export const PROBLEM_BANK = [
    // --- EASY ---
    {
        title: "Two Sum (Existence)",
        difficulty: "Easy",
        topic: "Array",
        statement: `<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, determine if there exist two distinct elements in the array that add up to <code>target</code>.</p><p><strong>Input Format:</strong><br>The first line contains an integer <code>n</code> (the size of the array).<br>The second line contains <code>n</code> space-separated integers.<br>The third line contains the <code>target</code> integer.</p><p><strong>Output Format:</strong><br>Print "True" if such a pair exists, otherwise print "False".</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "4\n2 7 11 15\n9", expectedOutput: "True" },
            { input: "3\n3 2 4\n6", expectedOutput: "True" },
            { input: "2\n3 3\n7", expectedOutput: "False" },
            { input: "1\n5\n10", expectedOutput: "False" },
            { input: "5\n1 2 3 4 5\n9", expectedOutput: "True" }
        ]
    },
    {
        title: "Valid Palindrome String",
        difficulty: "Easy",
        topic: "String",
        statement: `<p>A phrase is a <strong>palindrome</strong> if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.</p><p><strong>Input Format:</strong><br>A single string <code>s</code> on one line.</p><p><strong>Output Format:</strong><br>Print "True" if it is a palindrome, otherwise print "False".</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "raceacar", expectedOutput: "False" },
            { input: "madam", expectedOutput: "True" },
            { input: "aba", expectedOutput: "True" },
            { input: "hello", expectedOutput: "False" },
            { input: "a", expectedOutput: "True" }
        ]
    },
    {
        title: "Valid Parentheses",
        difficulty: "Easy",
        topic: "Stack",
        statement: `<p>Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.</p><p><strong>Input Format:</strong><br>A single string <code>s</code>.</p><p><strong>Output Format:</strong><br>Print "True" if valid, else "False".</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "()[]{}", expectedOutput: "True" },
            { input: "(]", expectedOutput: "False" },
            { input: "([{}])", expectedOutput: "True" },
            { input: "((", expectedOutput: "False" },
            { input: "]", expectedOutput: "False" }
        ]
    },
    {
        title: "Binary Search",
        difficulty: "Easy",
        topic: "Binary Search",
        statement: `<p>Given an array of integers <code>nums</code> which is sorted in ascending order, and an integer <code>target</code>, write a function to search <code>target</code> in <code>nums</code>. If <code>target</code> exists, return its 0-based index. Otherwise, return <code>-1</code>.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.<br>Line 3: integer <code>target</code>.</p><p><strong>Output Format:</strong><br>Print the index or -1.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "6\n-1 0 3 5 9 12\n9", expectedOutput: "4" },
            { input: "6\n-1 0 3 5 9 12\n2", expectedOutput: "-1" },
            { input: "1\n5\n5", expectedOutput: "0" },
            { input: "2\n2 5\n5", expectedOutput: "1" },
            { input: "3\n1 3 5\n1", expectedOutput: "0" }
        ]
    },
    {
        title: "Contains Duplicate",
        difficulty: "Easy",
        topic: "Array",
        statement: `<p>Given an integer array <code>nums</code>, return true if any value appears at least twice in the array, and return false if every element is distinct.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print "True" or "False".</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "4\n1 2 3 1", expectedOutput: "True" },
            { input: "4\n1 2 3 4", expectedOutput: "False" },
            { input: "10\n1 1 1 3 3 4 3 2 4 2", expectedOutput: "True" },
            { input: "1\n1", expectedOutput: "False" },
            { input: "2\n5 5", expectedOutput: "True" }
        ]
    },
    {
        title: "Missing Number",
        difficulty: "Easy",
        topic: "Bit Manipulation",
        statement: `<p>Given an array <code>nums</code> containing <code>n</code> distinct numbers in the range <code>[0, n]</code>, return the only number in the range that is missing from the array.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the missing number.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "3\n3 0 1", expectedOutput: "2" },
            { input: "2\n0 1", expectedOutput: "2" },
            { input: "9\n9 6 4 2 3 5 7 0 1", expectedOutput: "8" },
            { input: "1\n1", expectedOutput: "0" },
            { input: "1\n0", expectedOutput: "1" }
        ]
    },
    {
        title: "Valid Anagram",
        difficulty: "Easy",
        topic: "String",
        statement: `<p>Given two strings <code>s</code> and <code>t</code>, return true if <code>t</code> is an anagram of <code>s</code>, and false otherwise.</p><p><strong>Input Format:</strong><br>Line 1: string <code>s</code>.<br>Line 2: string <code>t</code>.</p><p><strong>Output Format:</strong><br>Print "True" or "False".</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "anagram\nnagaram", expectedOutput: "True" },
            { input: "rat\ncar", expectedOutput: "False" },
            { input: "a\na", expectedOutput: "True" },
            { input: "ab\na", expectedOutput: "False" },
            { input: "listen\nsilent", expectedOutput: "True" }
        ]
    },
    {
        title: "Reverse String",
        difficulty: "Easy",
        topic: "Two Pointers",
        statement: `<p>Write a function that reverses a string. The input string is given as a single word.</p><p><strong>Input Format:</strong><br>A single string <code>s</code>.</p><p><strong>Output Format:</strong><br>Print the reversed string.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "hello", expectedOutput: "olleh" },
            { input: "Hannah", expectedOutput: "hannaH" },
            { input: "a", expectedOutput: "a" },
            { input: "ab", expectedOutput: "ba" },
            { input: "racecar", expectedOutput: "racecar" }
        ]
    },
    {
        title: "Single Number",
        difficulty: "Easy",
        topic: "Bit Manipulation",
        statement: `<p>Given a non-empty array of integers <code>nums</code>, every element appears twice except for one. Find that single one. You must implement a solution with a linear runtime complexity and use only constant extra space.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the single number.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "3\n2 2 1", expectedOutput: "1" },
            { input: "5\n4 1 2 1 2", expectedOutput: "4" },
            { input: "1\n1", expectedOutput: "1" },
            { input: "7\n1 2 3 4 3 2 1", expectedOutput: "4" },
            { input: "3\n-1 -1 -2", expectedOutput: "-2" }
        ]
    },

    // --- MEDIUM ---
    {
        title: "Maximum Subarray Sum",
        difficulty: "Medium",
        topic: "Array",
        statement: `<p>Given an integer array <code>nums</code>, find the subarray with the largest sum, and return <em>its sum</em> (Kadane's Algorithm).</p><p><strong>Input Format:</strong><br>First line contains <code>n</code>.<br>Second line contains <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the maximum subarray sum.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "9\n-2 1 -3 4 -1 2 1 -5 4", expectedOutput: "6" },
            { input: "1\n1", expectedOutput: "1" },
            { input: "5\n5 4 -1 7 8", expectedOutput: "23" },
            { input: "3\n-1 -2 -3", expectedOutput: "-1" },
            { input: "4\n-2 -1 -3 -4", expectedOutput: "-1" }
        ]
    },
    {
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        topic: "Sliding Window",
        statement: `<p>Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.</p><p><strong>Input Format:</strong><br>A single string <code>s</code>.</p><p><strong>Output Format:</strong><br>Print an integer representing the length of the longest unique substring.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "abcabcbb", expectedOutput: "3" },
            { input: "bbbbb", expectedOutput: "1" },
            { input: "pwwkew", expectedOutput: "3" },
            { input: "abcdef", expectedOutput: "6" },
            { input: "", expectedOutput: "0" }
        ]
    },
    {
        title: "Container With Most Water",
        difficulty: "Medium",
        topic: "Two Pointers",
        statement: `<p>You are given an integer array <code>height</code> of length <code>n</code>. Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the maximum amount of water a container can store.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the maximum area.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "9\n1 8 6 2 5 4 8 3 7", expectedOutput: "49" },
            { input: "2\n1 1", expectedOutput: "1" },
            { input: "4\n4 3 2 14", expectedOutput: "12" },
            { input: "5\n1 2 1 2 1", expectedOutput: "4" },
            { input: "3\n1 2 4", expectedOutput: "2" }
        ]
    },
    {
        title: "Product of Array Except Self",
        difficulty: "Medium",
        topic: "Array",
        statement: `<p>Given an integer array <code>nums</code>, return an array <code>answer</code> such that <code>answer[i]</code> is equal to the product of all the elements of <code>nums</code> except <code>nums[i]</code>.</p><p>The product of any prefix or suffix of <code>nums</code> is guaranteed to fit in a 32-bit integer. You must write an algorithm that runs in O(n) time and without using the division operation.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print <code>n</code> space-separated integers.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "4\n1 2 3 4", expectedOutput: "24 12 8 6" },
            { input: "5\n-1 1 0 -3 3", expectedOutput: "0 0 9 0 0" },
            { input: "2\n2 3", expectedOutput: "3 2" },
            { input: "3\n0 0 0", expectedOutput: "0 0 0" },
            { input: "3\n1 0 2", expectedOutput: "0 2 0" }
        ]
    },
    {
        title: "Find Minimum in Rotated Sorted Array",
        difficulty: "Medium",
        topic: "Binary Search",
        statement: `<p>Suppose an array of length <code>n</code> sorted in ascending order is rotated between 1 and n times. Given the sorted rotated array <code>nums</code> of unique elements, return the minimum element of this array. You must write an algorithm that runs in O(log n) time.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the minimum integer.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "5\n3 4 5 1 2", expectedOutput: "1" },
            { input: "7\n4 5 6 7 0 1 2", expectedOutput: "0" },
            { input: "4\n11 13 15 17", expectedOutput: "11" },
            { input: "1\n1", expectedOutput: "1" },
            { input: "2\n2 1", expectedOutput: "1" }
        ]
    },
    {
        title: "Search in Rotated Sorted Array",
        difficulty: "Medium",
        topic: "Binary Search",
        statement: `<p>There is an integer array <code>nums</code> sorted in ascending order (with distinct values). Prior to being passed to your function, <code>nums</code> is possibly rotated at an unknown pivot index. Given the array <code>nums</code> after the possible rotation and an integer <code>target</code>, return the index of <code>target</code> if it is in <code>nums</code>, or -1 if it is not in <code>nums</code>. You must write an algorithm with O(log n) runtime complexity.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.<br>Line 3: integer <code>target</code>.</p><p><strong>Output Format:</strong><br>Print the index or -1.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "7\n4 5 6 7 0 1 2\n0", expectedOutput: "4" },
            { input: "7\n4 5 6 7 0 1 2\n3", expectedOutput: "-1" },
            { input: "1\n1\n0", expectedOutput: "-1" },
            { input: "1\n1\n1", expectedOutput: "0" },
            { input: "2\n3 1\n1", expectedOutput: "1" }
        ]
    },
    {
        title: "Longest Palindromic Substring",
        difficulty: "Medium",
        topic: "String",
        statement: `<p>Given a string <code>s</code>, return the longest palindromic substring in <code>s</code>.</p><p><strong>Input Format:</strong><br>A single string <code>s</code>.</p><p><strong>Output Format:</strong><br>Print the longest palindromic substring. If there are multiple, any valid one is accepted.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "babad", expectedOutput: "bab" }, // Note: "aba" is also valid, but checking might be tricky. Let's rely on standard output for these simple cases.
            { input: "cbbd", expectedOutput: "bb" },
            { input: "a", expectedOutput: "a" },
            { input: "ac", expectedOutput: "a" },
            { input: "racecar", expectedOutput: "racecar" }
        ]
    },
    {
        title: "Coin Change",
        difficulty: "Medium",
        topic: "Dynamic Programming",
        statement: `<p>You are given an integer array <code>coins</code> representing coins of different denominations and an integer <code>amount</code> representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers (coins).<br>Line 3: integer <code>amount</code>.</p><p><strong>Output Format:</strong><br>Print the minimum number of coins, or -1.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "3\n1 2 5\n11", expectedOutput: "3" },
            { input: "1\n2\n3", expectedOutput: "-1" },
            { input: "1\n1\n0", expectedOutput: "0" },
            { input: "3\n1 2 5\n100", expectedOutput: "20" },
            { input: "2\n1 2\n2", expectedOutput: "1" }
        ]
    },
    {
        title: "Subsets",
        difficulty: "Medium",
        topic: "Backtracking",
        statement: `<p>Given an integer array <code>nums</code> of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets. Print them sorted lexicographically, each on a new line (space-separated).</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers (sorted).</p><p><strong>Output Format:</strong><br>Print each subset on a new line. Print "[]" for the empty subset.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "3\n1 2 3", expectedOutput: "[]\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3" },
            { input: "2\n1 2", expectedOutput: "[]\n1\n1 2\n2" },
            { input: "1\n1", expectedOutput: "[]\n1" },
            { input: "1\n0", expectedOutput: "[]\n0" },
            { input: "0\n", expectedOutput: "[]" }
        ]
    },

    // --- HARD ---
    {
        title: "Trapping Rain Water",
        difficulty: "Hard",
        topic: "Two Pointers",
        statement: `<p>Given <code>n</code> non-negative integers representing an elevation map where the width of each bar is <code>1</code>, compute how much water it can trap after raining.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the total trapped water.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "12\n0 1 0 2 1 0 1 3 2 1 2 1", expectedOutput: "6" },
            { input: "6\n4 2 0 3 2 5", expectedOutput: "9" },
            { input: "3\n2 0 2", expectedOutput: "2" },
            { input: "2\n2 0", expectedOutput: "0" },
            { input: "5\n1 0 2 0 1", expectedOutput: "2" }
        ]
    },
    {
        title: "Minimum Window Substring",
        difficulty: "Hard",
        topic: "Sliding Window",
        statement: `<p>Given two strings <code>s</code> and <code>t</code> of lengths <code>m</code> and <code>n</code> respectively, return the minimum window substring of <code>s</code> such that every character in <code>t</code> (including duplicates) is included in the window. If there is no such substring, return the empty string "".</p><p><strong>Input Format:</strong><br>Line 1: string <code>s</code>.<br>Line 2: string <code>t</code>.</p><p><strong>Output Format:</strong><br>Print the substring.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "ADOBECODEBANC\nABC", expectedOutput: "BANC" },
            { input: "a\na", expectedOutput: "a" },
            { input: "a\naa", expectedOutput: "" },
            { input: "a\nb", expectedOutput: "" },
            { input: "aab\naab", expectedOutput: "aab" }
        ]
    },
    {
        title: "Largest Rectangle in Histogram",
        difficulty: "Hard",
        topic: "Stack",
        statement: `<p>Given an array of integers <code>heights</code> representing the histogram's bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the maximum area.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "6\n2 1 5 6 2 3", expectedOutput: "10" },
            { input: "2\n2 4", expectedOutput: "4" },
            { input: "1\n5", expectedOutput: "5" },
            { input: "4\n1 2 3 4", expectedOutput: "6" },
            { input: "5\n2 1 2 1 2", expectedOutput: "5" }
        ]
    },
    {
        title: "First Missing Positive",
        difficulty: "Hard",
        topic: "Array",
        statement: `<p>Given an unsorted integer array <code>nums</code>, return the smallest missing positive integer. You must implement an algorithm that runs in O(n) time and uses constant extra space.</p><p><strong>Input Format:</strong><br>Line 1: integer <code>n</code>.<br>Line 2: <code>n</code> space-separated integers.</p><p><strong>Output Format:</strong><br>Print the smallest missing positive integer.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "3\n1 2 0", expectedOutput: "3" },
            { input: "4\n3 4 -1 1", expectedOutput: "2" },
            { input: "5\n7 8 9 11 12", expectedOutput: "1" },
            { input: "1\n1", expectedOutput: "2" },
            { input: "1\n-1", expectedOutput: "1" }
        ]
    },
    {
        title: "Edit Distance",
        difficulty: "Hard",
        topic: "Dynamic Programming",
        statement: `<p>Given two strings <code>word1</code> and <code>word2</code>, return the minimum number of operations required to convert <code>word1</code> to <code>word2</code>. You have the following three operations permitted on a word: Insert a character, Delete a character, Replace a character.</p><p><strong>Input Format:</strong><br>Line 1: string <code>word1</code>.<br>Line 2: string <code>word2</code>.</p><p><strong>Output Format:</strong><br>Print the minimum number of operations.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "horse\nros", expectedOutput: "3" },
            { input: "intention\nexecution", expectedOutput: "5" },
            { input: "a\nb", expectedOutput: "1" },
            { input: "a\na", expectedOutput: "0" },
            { input: "abc\n", expectedOutput: "3" }
        ]
    },
    {
        title: "Longest Valid Parentheses",
        difficulty: "Hard",
        topic: "Dynamic Programming",
        statement: `<p>Given a string containing just the characters <code>'('</code> and <code>')'</code>, return the length of the longest valid (well-formed) parentheses substring.</p><p><strong>Input Format:</strong><br>A single string <code>s</code>.</p><p><strong>Output Format:</strong><br>Print the length of the longest valid substring.</p>`,
        starter_code: STARTER_TEMPLATES,
        test_cases: [
            { input: "(()", expectedOutput: "2" },
            { input: ")()())", expectedOutput: "4" },
            { input: "", expectedOutput: "0" },
            { input: "()(())", expectedOutput: "6" },
            { input: "((((", expectedOutput: "0" }
        ]
    }
]
