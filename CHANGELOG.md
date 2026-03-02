# Changelog - Book Rating & Sort/Filter Upgrade

## New Features

### Book Rating System
- Implemented `BookRating` component for users to rate and review books (1-5 stars).
- Added backend integration via `BookRatingController` to store ratings in the database.
- Calculated and displayed `average_rating` and `total_ratings` for each book.
- Added UI for community rating summary and individual user rating.
- Ensured responsive design and error handling for rating submission.

### Enhanced Sorting & Filtering
- Upgraded `FilterCheckbox` component with:
  - Tagging support (`tags`) with auto-suggestions and manual input.
  - Improved UI for filter categories (collapsible sections, search within filters).
  - Dynamic filtering logic in `PageContent` to support multiple criteria (Class, Subject, Publisher, Author, Tags).
- Updated `SortFilter` component to include sorting by "Rating Tertinggi" and "Rating Terendah".
- Added `src/utils/taggingSystem.ts` to generate automatic tags based on book metadata.

## Database Updates
- Added `book_ratings` table migration.
- Added `average_rating` and `total_ratings` columns to `books` and related tables via migration.

## Testing
- Added end-to-end tests in `e2e/book-rating.spec.ts` to verify rating display, submission, sorting, and filtering functionality.
