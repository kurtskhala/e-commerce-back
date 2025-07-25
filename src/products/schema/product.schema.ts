import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Product {
  @Prop({ Type: String })
  name: string;

  @Prop({ Type: String })
  price: string;

  @Prop({ Type: String })
  quantity: string;

  @Prop({ Type: String })
  category: string;

  @Prop({ Type: String })
  description: string;

  @Prop({ Type: String })
  image: string;

  imageData?: any;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
