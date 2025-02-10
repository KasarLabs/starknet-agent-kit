import TelegramBot from 'node-telegram-bot-api';
import express, { Express, Request, Response, Application } from 'express';
import { StarknetAgentInterface } from '../../tools/tools';

class TelegramBotServer {
  private token: string;
  private app: Application;
  private bot: TelegramBot;
  private port: number;
  private url: string;
  private pendingMessages: TelegramBot.Message[] = [];
  private resolveMessages: ((messages: TelegramBot.Message[]) => void) | null =
    null;
  private server: any;

  constructor() {
    this.token = '';
    this.port = 4040;
    this.url =
      '';

    this.app = express();
    this.bot = new TelegramBot(this.token, {
      webHook: { port: this.port },
    });
  }

  private async waitForPendingMessages(): Promise<TelegramBot.Message[]> {
    const webhookInfo = await this.bot.getWebHookInfo();
    let pendingCount = webhookInfo.pending_update_count;
    if (pendingCount > 5) {
      pendingCount = 5;
      console.log('seulemet 5 messages pas plus');
    }
    if (pendingCount === 0) {
      return [];
    }

    console.log(`En attente de ${pendingCount} messages...`);

    return new Promise((resolve) => {
      this.resolveMessages = resolve;

      // Timeout après 30 secondes si on ne reçoit pas tous les messages
      setTimeout(() => {
        if (this.resolveMessages) {
          console.log('Timeout: retour des messages reçus');
          this.resolveMessages(this.pendingMessages);
          this.resolveMessages = null;
        }
      }, 30000);
    });
  }

  private setupServer(): void {
    this.app.use(express.json());

    this.app.post(`/bot${this.token}`, (req: Request, res: Response) => {
      try {
        this.bot.processUpdate(req.body);
        res.sendStatus(200);
      } catch (error) {
        console.error("Erreur lors du traitement de l'update:", error);
        res.sendStatus(500);
      }
    });

    this.server = this.app.listen(this.port, () => {
      console.log(`Serveur démarré sur le port ${this.port}`);
    });
  }

  private async setupWebhook(): Promise<void> {
    try {
      await this.bot.deleteWebHook();
      console.log('Ancien webhook supprimé');

      await this.bot.setWebHook(`${this.url}/bot${this.token}`);
      console.log('Nouveau webhook configuré');

      const webhookInfo = await this.bot.getWebHookInfo();
      console.log('Info webhook:', webhookInfo);
    } catch (error) {
      console.error('Erreur lors de la configuration du webhook:', error);
    }
  }

  private setupBotHandlers(): void {
    this.bot.on('message', async (msg: TelegramBot.Message) => {
      try {
        // console.log('Message reçu:', {
        //   messageId: msg.message_id,
        //   date: new Date(msg.date * 1000).toISOString(),
        //   text: msg.text,
        //   from: msg.from?.username,
        // });

        this.pendingMessages.push(msg);

        const webhookInfo = await this.bot.getWebHookInfo();
        if (this.resolveMessages && webhookInfo.pending_update_count === 0) {
          this.resolveMessages(this.pendingMessages);
          this.resolveMessages = null;
        }
      } catch (error) {
        console.error('Erreur lors du traitement du message:', error);
      }
    });

    this.bot.on('error', (error: Error) => {
      console.error('Erreur du bot:', error);
    });

    this.bot.on('webhook_error', (error: Error) => {
      console.error('Erreur webhook:', error);
    });
  }

  private setupErrorHandlers(): void {
    process.on('unhandledRejection', (error: Error) => {
      console.error('Rejet non géré:', error);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('Exception non attrapée:', error);
    });
  }
  public async cleanup(): Promise<void> {
    try {
      await this.bot.deleteWebHook();
      console.log('Webhook supprimé');

      this.bot.removeAllListeners();
      console.log('Événements nettoyés');

      if (this.server) {
        await new Promise<void>((resolve) => {
          this.server.close(() => {
            console.log('Serveur Express arrêté');
            resolve();
          });
        });
      }
    } catch (error) {
      console.error('Erreur lors du nettoyage:', error);
    }
  }
  public async start(): Promise<string[]> {
    try {
      this.setupServer();
      this.setupBotHandlers();
      this.setupErrorHandlers();
      await this.setupWebhook();
      console.log('Bot démarré avec succès !');
      const string : string[] = [];

      const messages = await this.waitForPendingMessages();
      messages.forEach((message) => {
        string.push(message.text as string);
      })
      return string;
    } catch (error) {
      console.error('Erreur lors du démarrage du bot:', error);
      return [];
    }
  }
}

export const telegram_get_messages_from_conversation = async (agent: StarknetAgentInterface) => {
  try {
    const bot = new TelegramBotServer();
    const messages = await bot.start();
    console.log(messages);
    await bot.cleanup();
    return {
      status: 'success',
      messages: messages,
    };
  } catch (error) {
    console.log(error);
    return {
      status: 'error',
      error: error,
    };
  }
};
