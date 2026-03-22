type Lang = {
    ping: string
    ping_description: string
    ping_msg: string
    join: string
    join_description: string
    no_join: string
    join_msg: string
    join_failed: string
} 

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const lang: Lang = require('../../lang.json')
