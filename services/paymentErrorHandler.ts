/**
 * =========================================
 * ACI - Tratamento de Erros de Pagamento
 * =========================================
 * 
 * Sistema centralizado de tratamento de erros para operações de pagamento
 * Padroniza mensagens e códigos de erro
 */

// ==========================================
// TIPOS DE ERROS
// ==========================================

export enum PaymentErrorCode {
  // Erros de Configuração
  CONFIG_MISSING = 'CONFIG_MISSING',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  
  // Erros de Validação
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INVALID_USER = 'INVALID_USER',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  
  // Erros de Integração
  GATEWAY_UNAVAILABLE = 'GATEWAY_UNAVAILABLE',
  GATEWAY_ERROR = 'GATEWAY_ERROR',
  WEBHOOK_VALIDATION_FAILED = 'WEBHOOK_VALIDATION_FAILED',
  
  // Erros de Negócio
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  PAYMENT_EXPIRED = 'PAYMENT_EXPIRED',
  PAYMENT_DUPLICATE = 'PAYMENT_DUPLICATE',
  
  // Erros de Sistema
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  // Erros de Segurança
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SIGNATURE_INVALID = 'SIGNATURE_INVALID',
}

// ==========================================
// CLASSE DE ERRO PERSONALIZADA
// ==========================================

export class PaymentError extends Error {
  public readonly code: PaymentErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: Date;

  constructor(
    code: PaymentErrorCode,
    message: string,
    statusCode: number = 400,
    details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
    
    // Manter stack trace no ambiente de desenvolvimento
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PaymentError);
    }
  }

  /**
   * Converte erro para formato JSON serializável
   */
  toJSON() {
    return {
      error: true,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }

  /**
   * Cria mensagem de log formatada
   */
  toLogMessage(prefix: string = ''): string {
    return `[${prefix}] ${this.code}: ${this.message} (${this.timestamp.toISOString()})`;
  }
}

// ==========================================
// FACTORY DE ERROS COMUNS
// ==========================================

export class PaymentErrorFactory {
  // Erros de Configuração
  static configMissing(field: string): PaymentError {
    return new PaymentError(
      PaymentErrorCode.CONFIG_MISSING,
      `Configuração não encontrada: ${field}`,
      500,
      { field }
    );
  }

  static invalidCredentials(): PaymentError {
    return new PaymentError(
      PaymentErrorCode.INVALID_CREDENTIALS,
      'Credenciais de pagamento inválidas',
      401
    );
  }

  // Erros de Validação
  static invalidAmount(amount: number): PaymentError {
    return new PaymentError(
      PaymentErrorCode.INVALID_AMOUNT,
      `Valor inválido: ${amount}. Deve ser maior que zero.`,
      400,
      { amount }
    );
  }

  static invalidUser(userId?: string): PaymentError {
    return new PaymentError(
      PaymentErrorCode.INVALID_USER,
      'Usuário inválido ou não autenticado',
      401,
      { userId }
    );
  }

  static insufficientBalance(current: number, required: number): PaymentError {
    return new PaymentError(
      PaymentErrorCode.INSUFFICIENT_BALANCE,
      `Saldo insuficiente. Necessário: ${required}, Disponível: ${current}`,
      400,
      { current, required }
    );
  }

  // Erros de Integração
  static gatewayUnavailable(gateway: string): PaymentError {
    return new PaymentError(
      PaymentErrorCode.GATEWAY_UNAVAILABLE,
      `Gateway de pagamento indisponível: ${gateway}`,
      503,
      { gateway }
    );
  }

  static gatewayError(gateway: string, details?: any): PaymentError {
    return new PaymentError(
      PaymentErrorCode.GATEWAY_ERROR,
      `Erro no gateway de pagamento: ${gateway}`,
      502,
      { gateway, details }
    );
  }

  static webhookValidationFailed(reason: string): PaymentError {
    return new PaymentError(
      PaymentErrorCode.WEBHOOK_VALIDATION_FAILED,
      `Falha na validação do webhook: ${reason}`,
      401,
      { reason }
    );
  }

  // Erros de Negócio
  static paymentDeclined(reason: string): PaymentError {
    return new PaymentError(
      PaymentErrorCode.PAYMENT_DECLINED,
      `Pagamento recusado: ${reason}`,
      400,
      { reason }
    );
  }

  static paymentExpired(): PaymentError {
    return new PaymentError(
      PaymentErrorCode.PAYMENT_EXPIRED,
      'Pagamento expirado',
      400
    );
  }

  static paymentDuplicate(transactionId: string): PaymentError {
    return new PaymentError(
      PaymentErrorCode.PAYMENT_DUPLICATE,
      'Pagamento já processado',
      409,
      { transactionId }
    );
  }

  // Erros de Sistema
  static databaseError(operation: string, error: any): PaymentError {
    return new PaymentError(
      PaymentErrorCode.DATABASE_ERROR,
      `Erro no banco de dados durante: ${operation}`,
      500,
      { operation, error: error.message || error }
    );
  }

  static networkError(service: string, error: any): PaymentError {
    return new PaymentError(
      PaymentErrorCode.NETWORK_ERROR,
      `Erro de rede ao comunicar com: ${service}`,
      500,
      { service, error: error.message || error }
    );
  }

  static timeoutError(operation: string, timeoutMs: number): PaymentError {
    return new PaymentError(
      PaymentErrorCode.TIMEOUT_ERROR,
      `Timeout na operação: ${operation} (${timeoutMs}ms)`,
      408,
      { operation, timeoutMs }
    );
  }

  static internalError(message: string, error?: any): PaymentError {
    return new PaymentError(
      PaymentErrorCode.INTERNAL_ERROR,
      `Erro interno: ${message}`,
      500,
      { originalError: error?.message || error }
    );
  }

  // Erros de Segurança
  static unauthorized(): PaymentError {
    return new PaymentError(
      PaymentErrorCode.UNAUTHORIZED,
      'Não autorizado',
      401
    );
  }

  static forbidden(): PaymentError {
    return new PaymentError(
      PaymentErrorCode.FORBIDDEN,
      'Acesso negado',
      403
    );
  }

  static signatureInvalid(): PaymentError {
    return new PaymentError(
      PaymentErrorCode.SIGNATURE_INVALID,
      'Assinatura digital inválida',
      401
    );
  }
}

// ==========================================
// HANDLER DE ERROS
// ==========================================

export class PaymentErrorHandler {
  /**
   * Trata erro e retorna resposta apropriada
   */
  static handle(error: unknown): PaymentError {
    // Se já for PaymentError, retornar como está
    if (error instanceof PaymentError) {
      return error;
    }

    // Se for Error nativo do JavaScript
    if (error instanceof Error) {
      return PaymentErrorFactory.internalError(error.message, error);
    }

    // Se for string
    if (typeof error === 'string') {
      return PaymentErrorFactory.internalError(error);
    }

    // Qualquer outro tipo
    return PaymentErrorFactory.internalError('Erro desconhecido', error);
  }

  /**
   * Converte erro para resposta HTTP
   */
  static toHttpResponse(error: PaymentError): { status: number; body: any } {
    return {
      status: error.statusCode,
      body: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          timestamp: error.timestamp.toISOString(),
        },
      },
    };
  }

  /**
   * Loga erro de forma padronizada
   */
  static log(error: PaymentError, context?: string): void {
    const logLevel = error.statusCode >= 500 ? 'error' : 'warn';
    const contextStr = context ? `[${context}] ` : '';
    
    console[logLevel](
      `${contextStr}${error.toLogMessage('PAYMENT_ERROR')}`
    );
    
    // Log detalhado em desenvolvimento
    if (process.env.NODE_ENV === 'development' && error.details) {
      console[logLevel]('Detalhes:', JSON.stringify(error.details, null, 2));
    }
  }

  /**
   * Verifica se erro é recuperável
   */
  static isRecoverable(error: PaymentError): boolean {
    const unrecoverableCodes = [
      PaymentErrorCode.INVALID_CREDENTIALS,
      PaymentErrorCode.UNAUTHORIZED,
      PaymentErrorCode.FORBIDDEN,
      PaymentErrorCode.SIGNATURE_INVALID,
      PaymentErrorCode.INVALID_USER,
    ];

    return !unrecoverableCodes.includes(error.code);
  }
}

// ==========================================
// MIDDLEWARE PARA EXPRESS
// ==========================================

export function paymentErrorHandler(
  error: unknown,
  _req: any,
  res: any,
  _next: any
) {
  const paymentError = PaymentErrorHandler.handle(error);
  const httpResponse = PaymentErrorHandler.toHttpResponse(paymentError);
  
  // Logar erro
  PaymentErrorHandler.log(paymentError, 'Express Middleware');
  
  // Enviar resposta
  res.status(httpResponse.status).json(httpResponse.body);
}

export default paymentErrorHandler;