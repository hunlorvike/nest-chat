import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'user_presence' })
export class UserPresence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  statusMessage?: string;

  @Column({ default: false })
  showOffline: boolean;

  @Column({ default: true })
  isOnline: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastLogin: Date;
}
