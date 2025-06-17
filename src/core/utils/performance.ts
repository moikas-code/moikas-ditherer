export const chunk_processing = <T>(
  items: T[],
  chunk_size: number,
  process_chunk: (chunk: T[], start_index: number) => void,
  on_complete?: () => void
): void => {
  let index = 0;

  const process_next_chunk = () => {
    const chunk = items.slice(index, index + chunk_size);
    if (chunk.length === 0) {
      on_complete?.();
      return;
    }

    process_chunk(chunk, index);
    index += chunk_size;

    // Use requestIdleCallback if available for better performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(process_next_chunk, { timeout: 100 });
    } else {
      requestAnimationFrame(process_next_chunk);
    }
  };

  process_next_chunk();
};

export const create_worker_pool = (worker_count: number = navigator.hardwareConcurrency || 4) => {
  const workers: Worker[] = [];
  let current_worker = 0;

  return {
    add_worker: (worker: Worker) => {
      workers.push(worker);
    },
    get_next_worker: () => {
      const worker = workers[current_worker];
      current_worker = (current_worker + 1) % workers.length;
      return worker;
    },
    terminate_all: () => {
      workers.forEach(worker => worker.terminate());
      workers.length = 0;
    },
  };
};