type Lang = {
    ping: string
    ping_description: string
    join: string
    join_description: string
} 

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const lang: Lang = require('../config.json')
