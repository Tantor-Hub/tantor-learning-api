import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ResponseServer } from 'src/interface/interface.response';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from 'src/models/model.users';
import { Roles } from 'src/models/model.roles';
import { HasRoles } from 'src/models/model.userhasroles';
import { MailService } from 'src/services/service.mail';
import { AllSercices } from 'src/services/serices.all';
import { CryptoService } from 'src/services/service.crypto';
import { ConfigService } from '@nestjs/config';
import { Categories } from 'src/models/model.categoriesformations';
import { Responder } from 'src/strategy/strategy.responder';
import { HttpStatusCode } from 'src/config/config.statuscodes';
import { CreateThematicFormationDto } from './dto/create-thematic.dto';
import { Thematiques } from 'src/models/model.groupeformations';
import { log } from 'console';

@Injectable()
export class CategoriesService {
    constructor(
        @InjectModel(Users)
        private readonly userModel: typeof Users,

        @InjectModel(Roles)
        private readonly rolesModel: typeof Roles,

        @InjectModel(HasRoles)
        private readonly hasRoleModel: typeof HasRoles,

        @InjectModel(Categories)
        private readonly categoriesModel: typeof Categories,

        @InjectModel(Thematiques)
        private readonly thematicModel: typeof Thematiques,

        private readonly mailService: MailService,
        private readonly allService: AllSercices,
        private readonly cryptoService: CryptoService,
        private readonly configService: ConfigService
    ) { }

    async createCategory(createCategoryDto: CreateCategoryDto): Promise<ResponseServer> {
        const { category, description, id_thematique } = createCategoryDto
        return this.categoriesModel.create({
            category,
            id_thematic: id_thematique,
            description,
            status: 1
        })
            .then(categ => {
                if (categ instanceof Categories) return Responder({ status: HttpStatusCode.Created, data: categ })
                else return Responder({ status: HttpStatusCode.BadRequest, data: null })
            })
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async createThematic(createCategoryDto: CreateThematicFormationDto): Promise<ResponseServer> {
        const { thematic, description } = createCategoryDto;
        log(createCategoryDto)
        return this.thematicModel.create({
            thematic,
            description,
            status: 1
        })
            .then(categ => {
                if (categ instanceof Thematiques) return Responder({ status: HttpStatusCode.Created, data: categ })
                else return Responder({ status: HttpStatusCode.BadRequest, data: null })
            })
            .catch(err => {
                log(err)
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
    }

}
