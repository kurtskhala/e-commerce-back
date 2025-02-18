import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String })
  firstName: string;

  @Prop({ type: String })
  lastName: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String, select: false })
  password: string;

  @Prop({ default: 'user' })
  role: 'user' | 'editor' | 'admin';

  @Prop({
    type: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: String,
        quantity: String,
      },
    ],
    default: [],
  })
  cart: Array<{
    productId: mongoose.Schema.Types.ObjectId;
    name: string;
    price: string;
    quantity: string;
  }>;

  @Prop({
    type: [
      {
        items: [
          {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String,
            price: String,
            quantity: String,
          },
        ],
        total: String,
        date: Date,
      },
    ],
    default: [],
  })
  orderHistory: Array<{
    items: Array<{
      productId: mongoose.Schema.Types.ObjectId;
      name: string;
      price: string;
      quantity: string;
    }>;
    total: string;
    date: Date;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
