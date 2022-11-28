import { Entity, PrimaryGeneratedColumn, Column, Double } from "typeorm"

@Entity()
export class TargetTemperature {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'timestamp' }) //_time_with_timezone
    timeStamp: Date;

    @Column()
    room: string

    @Column("decimal", { precision: 5, scale: 2 })
    value: number
}