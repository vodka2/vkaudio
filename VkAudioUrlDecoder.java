public class VkAudioUrlDecoder {

    private static final String ALL_SYMBOLS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=";
    private static final String ALL_SYMBOLS_2X = ALL_SYMBOLS + ALL_SYMBOLS;


    public static String decode(String originalUrl, String userId) {
        String[] vals = originalUrl.split("/?extra=")[1].split("#");
        String tstr = vk_o(vals[0]);
        String ops = vk_o(vals[1]);
        String[] ops_arr = ops.split("\u0009");
        for (int i = ops_arr.length - 1; i >= 0; i--) {
            String[] args_arr = ops_arr[i].split("\u000B");
            String op_ind = array_shift(args_arr);
            switch (op_ind) {
                case "v":
                    tstr = vk_v(tstr);
                    break;
                case "r":
                    tstr = vk_r(tstr, Integer.parseInt(args_arr[0]));
                    break;
                case "x":
                    tstr = vk_x(tstr, args_arr[0]);
                    break;
                case "s":
                    tstr = vk_s(tstr, Integer.parseInt(args_arr[0]));
                    break;
                case "i":
                    tstr = vk_i(tstr, Integer.parseInt(args_arr[0]), Integer.parseInt(userId));
                    break;
            }
        }
        return tstr;
    }

    private static String vk_o(String str) {
        StringBuilder result = new StringBuilder();
        int i = 0;
        for (int s = 0, index2 = 0; s < str.length(); s++) {
            int sym_index = ALL_SYMBOLS.indexOf(str.charAt(s));
            if (sym_index >= 0) {
                if ((index2 % 4) != 0)
                    i = (i << 6) + sym_index;
                else
                    i = sym_index;

                if ((index2 % 4) != 0) {
                    index2++;
                    int shift = -2 * index2 & 6;
                    result.append(((char) (0xFF & (i >> shift))));
                } else {
                    index2++;
                }
            }
        }
        return result.toString();
    }

    private static String vk_s(String str, int start) {
        int len = str.length();
        if (len <= 0)
            return str;

        int cur = Math.abs(start);
        int[] shuffle_pos = new int[len];
        for (int i = len - 1; i >= 0; i--)
            shuffle_pos[i] = cur = ((len * (i + 1)) ^ cur + i) % len;
        for (int i = 1; i < len; i++)
            str = swap(str, i, shuffle_pos[len - i - 1]);

        return str;
    }

    private static String vk_i(String str, int i, int userId) {
        return vk_s(str, i ^ userId);
    }

    private static String vk_v(String str) {
        return new StringBuilder(str).reverse().toString();
    }

    private static String vk_r(String str, int i) {
        StringBuilder result = new StringBuilder();
        for (int s = 0; s < str.length(); s++) {
            int index = ALL_SYMBOLS_2X.indexOf(str.charAt(s));
            if (index >= 0) {
                int offset = index - i;
                if (offset < 0)
                    offset += ALL_SYMBOLS_2X.length();
                result.append(ALL_SYMBOLS_2X.charAt(offset));
            } else
                result.append(str.charAt(s));
        }
        return result.toString();
    }

    private static String vk_x(String str, String arg) {
        char xor_val = arg.charAt(0);
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < str.length(); i++)
            result.append((char) (str.charAt(i) ^ xor_val));
        return result.toString();
    }

    private static String swap(String str, int i, int j) {
        StringBuilder builder = new StringBuilder(str);
        builder.setCharAt(i, str.charAt(j));
        builder.setCharAt(j, str.charAt(i));
        return builder.toString();
    }

    private static String array_shift(String[] args) {
        String firstArg = args[0];
        System.arraycopy(args, 1, args, 0, args.length - 1);
        return firstArg;
    }
}
