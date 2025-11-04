import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { User } from 'src/user/models/user.models';

interface LessonAttributes {
  user_id: number;
  title: string;
  published: boolean;
  content: string;
  position: number;
  duration: number;
}

@Table({ tableName: 'lesson' })
export class Lesson extends Model<Lesson, LessonAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
  })
  user_id: number;


  @Column({
    type: DataType.INTEGER,
  })
  position: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    defaultValue: '',
  })
  content: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  published: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  duration: number;
}