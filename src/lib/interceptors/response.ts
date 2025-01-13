import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AgentResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        let parsedData;

        // If data is a string, try to parse it
        if (typeof data === 'string') {
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            parsedData = { text: data };
          }
        } else {
          parsedData = data;
        }

        // If the parsed data already has the expected structure, return it directly
        if (parsedData?.data?.output) {
          return parsedData.data;
        }

        // Format the response
        return {
          input: context.switchToHttp().getRequest().body?.request || '',
          output: [
            {
              index: 0,
              type: 'text',
              text:
                parsedData?.text ||
                parsedData?.message ||
                JSON.stringify(parsedData),
            },
          ],
        };
      })
    );
  }
}
