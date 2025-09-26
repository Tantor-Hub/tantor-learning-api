export interface IStudentSession {
  id?: string; // Made optional for creation
  id_session: string; // UUID from TrainingSession
  id_student: string; // UUID from Users
  createdAt?: Date;
  updatedAt?: Date;
}
