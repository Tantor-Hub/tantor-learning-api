const table_prefix = "___tbl_tantor_";

export enum tables {
    appinfos = `${table_prefix}infos`,
    users = `${table_prefix}users`,
    roles = `${table_prefix}roles`,
    hasroles = `${table_prefix}hasroles`,
    cours = `${table_prefix}cours`,
    categories = `${table_prefix}categoriesformations`,
    groupefromations = `${table_prefix}thematicsformations`,
    fromations = `${table_prefix}formationsascours`,
    sessions = `${table_prefix}sessions`,
    formateurhassession = `${table_prefix}formathassession`,
    sessionsuivi = `${table_prefix}suivisessions`,
    statgiairehassession = `${table_prefix}staghassessions`,
    statgiairehassessionhasseance = `${table_prefix}staghassessionshasseances`,
    apres_formation_docs = `${table_prefix}docsapresformations`,
    avant_formation_docs = `${table_prefix}docsavantformations`,
    pendant_formation_docs = `${table_prefix}docspendantformations`,
    reclamations_sanctions = `${table_prefix}docsreclamationformations`,
    payementmethode = `${table_prefix}payementmethode`,
    homeworks = `${table_prefix}homeworks`,
    messages = `${table_prefix}messages`,
    seancesessions = `${table_prefix}seancessessions`,
    homeworkssessions = `${table_prefix}homeworkssessions`
}