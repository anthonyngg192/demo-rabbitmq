import { ArrayMinSize, IsNotEmpty } from 'class-validator';
import { RoomType } from '../constants/room.type';

export class JoinRoomDTO {
    @IsNotEmpty()
    type: RoomType;

    @ArrayMinSize(1)
    values: string[];
}