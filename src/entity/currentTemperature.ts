import { Entity, PrimaryGeneratedColumn, Column, Double } from "typeorm"

@Entity('current_temperature')
export class CurrentTemperature {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'timestamp' }) //_time_with_timezone
    timeStamp: Date;

    @Column("decimal", { precision: 5, scale: 2 })
    value: number

    @Column()
    room: string
}