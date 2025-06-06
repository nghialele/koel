import { expect, it } from 'vitest'
import UnitTestCase from '@/__tests__/UnitTestCase'
import factory from '@/__tests__/factory'
import { eventBus } from '@/utils/eventBus'
import { youTubeService } from './youTubeService'

new class extends UnitTestCase {
  protected test () {
    it('plays a video', () => {
      const video = factory('video', {
        id: {
          videoId: 'foo',
        },
        snippet: {
          title: 'Bar',
        },
      })

      const emitMock = this.mock(eventBus, 'emit')

      youTubeService.play(video)

      expect(emitMock).toHaveBeenCalledWith('PLAY_YOUTUBE_VIDEO', { id: 'foo', title: 'Bar' })
    })
  }
}
