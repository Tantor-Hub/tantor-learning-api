const table_prefix = "___tbl_tantor_";

export enum tables {
    users = `${table_prefix}users`,
    roles = `${table_prefix}roles`,
    hasroles = `${table_prefix}hasroles`,
    cours = `${table_prefix}cours`,
    categories = `${table_prefix}categoriesformations`,
    groupefromations = `${table_prefix}thematicsformations`,
    fromations = `${table_prefix}formationsascours`,
    sessions = `${table_prefix}sessions`
}