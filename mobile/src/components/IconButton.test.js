import { fireEvent, renderWithProviders } from '../test/render.js';
import IconButton from './IconButton.js';

describe('IconButton', () => {
  it('is a labelled button that calls onPress', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithProviders(<IconButton icon="close" label="Close details" onPress={onPress} />);
    await fireEvent.press(getByLabelText('Close details'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reports no selected state unless it is a toggle', async () => {
    const { getByLabelText } = await renderWithProviders(<IconButton icon="close" label="Close" />);
    expect(getByLabelText('Close').props.accessibilityState?.selected).toBeUndefined();
  });

  it.each([true, false])('reports a toggle as selected=%s', async (selected) => {
    const { getByLabelText } = await renderWithProviders(
      <IconButton icon="heart" label="Toggle favorite" selected={selected} />
    );
    const button = getByLabelText('Toggle favorite');
    if (selected) expect(button).toBeSelected();
    else expect(button).not.toBeSelected();
    expect(button.props.accessibilityState?.selected).toBe(selected);
  });
});
