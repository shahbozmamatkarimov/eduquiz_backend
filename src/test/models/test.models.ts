import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { Test_settings } from '../../test_settings/models/test_settings.models';
import { Lesson } from 'src/lesson/models/lesson.models';
import { User } from 'src/user/models/user.models';

interface TestsAttributes {
  question: string;
  variants: string[];
  true_answer: number;
  type: string;
  code: string;
  user_id: number;
}

@Table({ tableName: 'tests' })
export class Tests extends Model<Tests, TestsAttributes> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  question: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: false,
  })
  variants: string[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  true_answer: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;


  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'SET NULL',
  })
  user_id: number;

  @BelongsTo(() => User)
  user: User;
}
