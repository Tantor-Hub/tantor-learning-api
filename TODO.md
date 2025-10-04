# Fix Foreign Key Constraint Error in Lesson Creation

## Tasks

- [x] Modify `createLesson` method in `src/lesson/lesson.service.ts` to validate `id_cours` exists in `SessionCours` table before creating the lesson.
- [x] Add import for `BadRequestException` from `@nestjs/common`.
- [x] In `createLesson`, query `SessionCours` with `findByPk(id_cours)` and throw `BadRequestException` if not found.
- [x] Test the fix with valid and invalid `id_cours`.
