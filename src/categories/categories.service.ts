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
import { error, log } from 'console';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateThematicFormationDto } from './dto/update-thematic.dto';

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
            ThematicId: id_thematique,
            description,
            status: 1
        })
            .then(categ => {
                if (categ instanceof Categories) return Responder({ status: HttpStatusCode.Created, data: categ })
                else return Responder({ status: HttpStatusCode.BadRequest, data: null })
            })
            .catch(err => {
                log(err)
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
    }

    async createThematic(createCategoryDto: CreateThematicFormationDto): Promise<ResponseServer> {
        const { thematic, description } = createCategoryDto;
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
                return Responder({ status: HttpStatusCode.InternalServerError, data: err })
            })
    }

    async getCategoriesFormations(): Promise<ResponseServer> {

        Categories.belongsTo(Thematiques, { foreignKey: "ThematicId" })
        return this.categoriesModel.findAll({
            include: [
                {
                    model: Thematiques,
                    required: true,
                    attributes: {
                        exclude: ['status']
                    }
                }
            ],
            where: {
                status: 1
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

    async updateCategorieFormations(idCategory: number, updateCategoryDto: UpdateCategoryDto): Promise<ResponseServer> {
        if (Object.keys(updateCategoryDto).length > 0) {
            return this.categoriesModel.findOne({
                where: {
                    id: idCategory
                }
            })
                .then(categ => {
                    if (categ instanceof Categories) {
                        return categ.update({
                            ...updateCategoryDto,
                            ...updateCategoryDto.hasOwnProperty('id_thematique') ? { ThematicId: updateCategoryDto.id_thematique } : {}
                        })
                            .then(_ => Responder({ status: HttpStatusCode.Ok, data: categ }))
                            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                    } else {
                        return Responder({ status: HttpStatusCode.NotFound, data: `La categorrie:${idCategory} n'a pas ete retrouver dans le système ` })
                    }
                })
                .catch(error => Responder({ status: HttpStatusCode.InternalServerError, data: error }))
        } else {
            return Responder({ status: HttpStatusCode.BadRequest, data: "The body should not be empty !" })
        }
    }

    async updateThematicFormations(idThematic: number, updateCategoryDto: UpdateThematicFormationDto): Promise<ResponseServer> {
        if (Object.keys(updateCategoryDto).length > 0) {
            return this.thematicModel.findOne({
                where: {
                    id: idThematic
                }
            })
                .then(categ => {
                    if (categ instanceof Categories) {
                        return categ.update({
                            ...updateCategoryDto,
                        })
                            .then(_ => Responder({ status: HttpStatusCode.Ok, data: categ }))
                            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
                    } else {
                        return Responder({ status: HttpStatusCode.NotFound, data: `La Thematique : ${idThematic} n'a pas ete retrouver dans le système ` })
                    }
                })
                .catch(error => Responder({ status: HttpStatusCode.InternalServerError, data: error }))
        } else {
            return Responder({ status: HttpStatusCode.BadRequest, data: "The body should not be empty !" })
        }
    }

    async getThematicsFormations(): Promise<ResponseServer> {
        return this.thematicModel.findAll({
            where: {
                status: 1
            }
        })
            .then(list => Responder({ status: HttpStatusCode.Ok, data: { length: list.length, list } }))
            .catch(err => Responder({ status: HttpStatusCode.InternalServerError, data: err }))
    }

}
