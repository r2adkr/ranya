type Lang = {
    ping: string
    ping_description: string
    ping_msg: string
    join: string
    join_description: string
    already_joined: string
    full: string
    no_join: string
    join_msg: string
    join_failed: string
    leave: string
    leave_description: string
    leave_msg: string
} 

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const lang: Lang = require('../../lang.json')
