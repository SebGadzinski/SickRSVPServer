/**
 * @author Sebastian Gadzinski
 */
import mongoose, { Document, Model, Schema } from 'mongoose';
import { transform } from '../utils/transform';

export interface IGift extends Document {
    section: string;
    name: string;
    status: string;
    user?: string;
    createdBy: string;
    updatedBy: string;
}

interface IGiftDataModel extends Model<IGift> { }

const GiftSchema: Schema = new mongoose.Schema(
    {
        section: { type: String, required: true },
        name: { type: String, required: true },
        status: { type: String, required: true },
        user: { type: String }
    },
    {
        timestamps: true,
        toJSON: { transform }
    }
);

const Gift: IGiftDataModel = mongoose.model<IGift, IGiftDataModel>(
    'gift',
    GiftSchema
);
export default Gift;
