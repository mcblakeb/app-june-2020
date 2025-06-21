# Provider Match Application

## Overview

This application helps healthcare providers match patient records between internal and external databases. It identifies potential matches between patients by analyzing various data fields including names, dates of birth, phone numbers, and addresses. The app provides a user-friendly interface to review, approve, or deny these matches, helping to maintain accurate patient records across different systems.

---

## How the Matching Algorithm Works

The application uses a sophisticated scoring system to identify potential patient matches:

### **Field Weighting**

- **First Name**: 15% weight
- **Last Name**: 25% weight
- **Date of Birth**: 25% weight
- **Phone Number**: 20% weight
- **Address**: 15% weight

### **Scoring Logic**

1. **Exact Matches**: Fields that match exactly receive 100% contribution
2. **Similarity Scores**: Non-exact fields use Levenshtein distance to calculate similarity ratios
3. **Weighted Average**: All field scores are combined using their respective weights
4. **Bonus System**: Additional points awarded for multiple exact matches (5% for 2+ matches, 10% for 3+ matches)

### **Match Criteria**

A potential match is identified when:

- First and last names match exactly, OR
- Date of birth and last name match exactly, OR
- Phone numbers match exactly, OR
- Addresses match exactly, OR
- Name similarities exceed 80% thresholds, OR
- Address and last name similarities exceed 70% thresholds

### **Similarity Calculation**

The algorithm uses Levenshtein distance to measure string similarity:

- **Perfect match**: 100% similarity
- **Completely different**: 0% similarity
- **Partial matches**: Scaled based on edit distance

### **Quality Assurance**

- Matches with 0% name similarity and non-matching DOB are automatically excluded
- All matches are sorted by score (highest first)
- Visual indicators (green checkmarks) show exact field matches
- Users can approve or deny matches with persistent status tracking

## Running the Project Locally

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [VS Code](https://code.visualstudio.com/) (optional)

---

### Running from the Command Line

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser and go to [http://localhost:3000](http://localhost:3000)

---

### Running in VS Code

1. Open the project folder in VS Code.

2. Make sure dependencies are installed:

   - Open a terminal in VS Code and run:
     ```bash
     npm install
     ```

3. Go to the **Run and Debug** panel (Ctrl+Shift+D).

4. Select **Next.js: npm run dev** from the dropdown.

5. Click the green **Run** button (or press F5).

6. Open your browser and go to [http://localhost:3000](http://localhost:3000)

---
