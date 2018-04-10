import { OpensearchWebPage } from './app.po';

describe('opensearch-web App', () => {
  let page: OpensearchWebPage;

  beforeEach(() => {
    page = new OpensearchWebPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
