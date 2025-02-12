import { IsMongoId } from 'class-validator';
import mongoose from 'mongoose';
export class IsValidMongoId {
  @IsMongoId()
  id: mongoose.Schema.Types.ObjectId;
}
