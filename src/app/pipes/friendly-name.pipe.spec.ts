import { FriendlyNamePipe } from './friendly-name.pipe';

describe('FriendlyNamePipe', () => {
  it('create an instance', () => {
    const pipe = new FriendlyNamePipe();
    expect(pipe).toBeTruthy();
  });
});
