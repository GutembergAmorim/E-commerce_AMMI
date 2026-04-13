import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadService } from '../../services/uploadService';
import api from '../../services/api';

vi.mock('../../services/api');

describe('uploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload an image using FormData', async () => {
      const mockResponse = { data: { success: true, url: 'http://image.url' } };
      api.post.mockResolvedValueOnce(mockResponse);

      // Create a dummy Blob / File for testing
      const file = new Blob(['dummy content'], { type: 'image/png' });

      const result = await uploadService.uploadImage(file, 'test/folder');

      expect(api.post).toHaveBeenCalledTimes(1);
      
      const callArgs = api.post.mock.calls[0];
      expect(callArgs[0]).toBe('/upload/image?folder=test%2Ffolder');
      
      const formData = callArgs[1];
      const imageField = formData.get('image');
      expect(imageField).toBeInstanceOf(File);
      expect(imageField.size).toBe(file.size);
      expect(imageField.type).toBe(file.type);
      
      expect(callArgs[2]).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('deleteImage', () => {
    it('should delete an image using publicId encoded', async () => {
      const mockResponse = { data: { success: true } };
      api.delete.mockResolvedValueOnce(mockResponse);

      const result = await uploadService.deleteImage('folder/image123');

      expect(api.delete).toHaveBeenCalledWith('/upload/image/folder%2Fimage123');
      expect(result).toEqual(mockResponse.data);
    });
  });
});
