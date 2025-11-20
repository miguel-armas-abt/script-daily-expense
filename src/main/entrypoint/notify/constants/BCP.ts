export const BCP = Object.freeze({

    FROM_NOTIFICATIONS: "notificaciones@notificacionesbcp.com.pe",
    FROM_NOTIFICATIONS_YAPE: "notificaciones@yape.pe",
    FROM_NOREPLY_YAPE: "noreply@yape.pe",

    SUBJECT_DEBIT_CARD: "Realizaste un consumo con tu Tarjeta de Débito BCP - Servicio de Notificaciones BCP",
    SUBJECT_CREDIT_CARD: "Realizaste un consumo con tu Tarjeta de Crédito BCP - Servicio de Notificaciones BCP",
    SUBJECT_YAPE_SERVICE: "Tu yapeo de servicio ha sido confirmado",
    SUBJECT_YAPE: "Pago exitoso",

} as const)

export const BCPPatterns = Object.freeze({

    FROM_NOTIFICATIONS_BCP: /notificaciones@notificacionesbcp\.com\.pe/i,
    FROM_NOTIFICATIONS_YAPE: /notificaciones@yape\.pe/i,
    FROM_NOREPLY_YAPE: /noreply@yape\.pe/i,

} as const)