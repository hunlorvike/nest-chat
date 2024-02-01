import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  about?: string;

  @Column({ nullable: true, length: 255 })
  avatar?: string;

  @Column({ nullable: true, length: 255 })
  banner?: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
