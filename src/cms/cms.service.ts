import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { ResponseServer } from 'src/interface/interface.response';
import { AppInfos } from 'src/models/model.appinfos';
import { AllSercices } from 'src/services/serices.all';
import { Responder } from 'src/strategy/strategy.responder';
import { CreateAppInfosDto } from './dto/create-infos.dto';
import { CreationAttributes } from 'sequelize';

@Injectable()
export class CmsService {
    constructor(
        private readonly sllSercices: AllSercices,
        @InjectModel(AppInfos)
        private readonly appInfosModel: typeof AppInfos
    ) { }

    async onGetAppInfos(): Promise<ResponseServer> {
        return this.appInfosModel.findOne({
            where: { id: 1 }
        })
            .then(infos => Responder({ status: HttpStatusCode.Ok, data: infos }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
    
    async onAddAppInfos(createAppInfosDto: CreateAppInfosDto): Promise<ResponseServer> {
        const { adresse, contacts_numbers, email_contact, about_app } = createAppInfosDto
        return this.appInfosModel.findOrCreate({
            where: {
                id: 1
            },
            defaults: {
                contacts_numbers,
                email_contact,
                adresse,
                about_app
            } as CreationAttributes<AppInfos>,
        })
            .then(([record, isNew]) => Responder({ status: HttpStatusCode.Created, data: record }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }
}
