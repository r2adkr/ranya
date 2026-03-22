import { Extension, listener } from '@pikokr/command.ts'

class EventExtension extends Extension {
  @listener({ event: 'clientReady' })
  async ready() {
    this.logger.info(`Logged in as ${this.client.user?.tag}`)
    await this.commandClient.fetchOwners()
  }
  
  @listener({ event: 'applicationCommandInvokeError', emitter: 'cts' })
  async errorHandler(err: Error) {
    this.logger.error(err)
  }
}

export const setup = async () => {
  return new EventExtension()
}
