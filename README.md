# Calendar and Period Management Application

This is a React-based application designed to manage and visualize periods (e.g., vacations, internships, courses) in a calendar format. It allows users to input personal information, add and delete periods, and visualize them on a calendar with color-coded legends. The application also supports exporting the calendar to a PDF file.

## Features

- **Personal Information Input**: Users can input their first name and last name.
- **Period Management**: Users can add, delete, and manage multiple periods with start and end dates.
- **Calendar Visualization**: Periods are displayed on a calendar with color-coded legends for different types of periods (e.g., vacation, internships, courses).
- **Working Days Calculation**: The application calculates the number of working days for each month, excluding weekends and Polish holidays.
- **PDF Export**: Users can export the calendar with their personal information to a PDF file.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **Tailwind CSS**: A utility-first CSS framework for styling the application.
- **Date Utilities**: Custom utility functions for date manipulation, validation, and working day calculations.
- **PDF Export**: A utility function to export the calendar to a PDF file.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name

2. **Install dependencies:**
    ```bash
   npm install
3. **Run the development server:**
    ```bash
   npm run dev
4. **Open your browser and navigate to: http://localhost:3000**


## Usage

### 1. Input Personal Information:

* Enter your first name and last name in the input fields provided at the top of the page.

### 2. Add Periods:

*    Click the + button to add a new period.
* For each period, enter the start and end dates in the format DD/MM/RRRR.

### 3. Delete Periods

*    To delete a period, click the × button next to the period you want to remove. Note that you cannot delete the last remaining period.

### 4. Visualize Periods on the Calendar

* Once valid periods are entered, the calendar will display the periods.

* Use the legend to color-code different types of periods (e.g., vacation, internships, courses).

* Click on a day in the calendar to assign a period type to it.

### 5. Export to PDF

*    Click the "Zapisz PDF" button at the bottom right of the page to export the calendar with your personal information to a PDF file.

## Code Structure:

* page.tsx: The main part that handles the UI, state management, and logic for the application.

* /utils: Contains utility functions for date manipulation, validation, working day calculations, and PDF export.

* /components: Contains reusable components like ErrorPopup and PeriodStats.

* /types: Contains TypeScript type definitions for periods and colored ranges.

## Customization:

* Add New Period Types: To add new period types, update the legendItems array in page.tsx with the desired color and label.

* Modify Date Format: If you need to change the date format, update the formatDate function in the handleDayClick function.

### Contributing:

Contributions are welcome! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.