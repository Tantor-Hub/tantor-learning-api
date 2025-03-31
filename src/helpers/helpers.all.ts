import { HttpStatusMessages } from "src/config/statusmessages.config"

export const Responder = ({status, data}: {status: number, data?: any}) => {
    return {status, message: HttpStatusMessages[status] ?? "Unknown", data: data ?? null}
}