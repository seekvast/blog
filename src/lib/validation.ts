import { z } from 'zod'
import { toast } from '@/components/ui/use-toast'

export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: z.ZodError
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      // 获取第一个错误消息
      const firstError = error.errors[0]
      const message = firstError?.message || '验证失败'
      
      // 显示错误提示
      toast({
        title: '输入错误',
        description: message,
        variant: 'destructive'
      })

      throw new ValidationError(message, error)
    }
    throw error
  }
}

export function validateAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> {
  return schema.parseAsync(data).catch(error => {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      const message = firstError?.message || '验证失败'
      
      toast({
        title: '输入错误',
        description: message,
        variant: 'destructive'
      })

      throw new ValidationError(message, error)
    }
    throw error
  })
}

export function createValidator<T>(schema: z.ZodSchema<T>) {
  return {
    validate: (data: unknown) => validate(schema, data),
    validateAsync: (data: unknown) => validateAsync(schema, data)
  }
}
