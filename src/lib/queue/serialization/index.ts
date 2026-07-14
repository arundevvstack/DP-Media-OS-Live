/**
 * Serializes and deserializes payloads for the Queue, ensuring complex types
 * like Dates and Error objects are correctly converted.
 */
export class QueueSerializer {
  public static serialize(payload: any): string {
    return JSON.stringify(payload, (key, value) => {
      if (value instanceof Error) {
        return {
          type: 'Error',
          message: value.message,
          stack: value.stack,
          name: value.name
        };
      }
      return value;
    });
  }

  public static deserialize(serialized: string): any {
    return JSON.parse(serialized, (key, value) => {
      if (value && typeof value === 'object' && value.type === 'Error') {
        const err = new Error(value.message);
        err.name = value.name;
        err.stack = value.stack;
        return err;
      }
      // Re-inflate ISO strings to Dates if desired (usually handled in business logic, but safe to do here)
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) return date;
      }
      return value;
    });
  }
}
