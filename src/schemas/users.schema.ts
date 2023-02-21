
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
class Contact {

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    phone: string;
}

export const contactSchema = SchemaFactory.createForClass(Contact);

@Schema()
export class User {
    _id: Types.ObjectId

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true, select: false })
    password: string;

    @Prop({ required: true})
    name: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: false, select: false, /*type: [contactSchema]*/ })
    contacts: Contact[];
}

export const UserSchema = SchemaFactory.createForClass(User);
