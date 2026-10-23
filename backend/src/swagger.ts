import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, type OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

/** Builds the OpenAPI (Swagger) description of every endpoint. */
export function buildOpenApi(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Mandi Bhav API')
    .setDescription(
      'Daily wholesale mandi prices (₹ per quintal). Source: AGMARKNET via data.gov.in (OGD Platform India).',
    )
    .setVersion('1.0.0')
    .addServer('/api')
    .build();
  return SwaggerModule.createDocument(app, config, {
    // keep operationIds clean so Orval generates nice hook names (useListPrices, ...)
    operationIdFactory: (_controllerKey, methodKey) => methodKey,
    ignoreGlobalPrefix: true,
  });
}
