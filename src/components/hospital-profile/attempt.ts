import { toast } from 'sonner@2.0.3';
import { ProfileStorageError } from '../../services/hospitalProfileService';

/**
 * Run a Hospital Profile change; show `success` when it worked, or one clear
 * error when it couldn't be stored. Returns whether it worked.
 */
export function attempt(change: () => void, success?: string): boolean {
  try {
    change();
  } catch (e) {
    if (e instanceof ProfileStorageError) {
      toast.error('Not saved: browser storage is full. Remove large images or PDFs and try again.');
      return false;
    }
    throw e;
  }
  if (success) toast.success(success);
  return true;
}
