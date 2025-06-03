<?php
/**
 * Plugin Name: POS System Integration
 * Plugin URI: https://your-website.com
 * Description: Integrates React POS system with WooCommerce
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://your-website.com
 * Text Domain: pos-plugin
 * Requires PHP: 7.4
 */

defined('ABSPATH') || exit;

// Ensure WooCommerce is active
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    return;
}

class POS_Integration {
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }

    public function register_routes() {
        register_rest_route('pos/v1', '/settings', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_settings'),
            'permission_callback' => array($this, 'check_permission'),
        ));
    }

    public function check_permission() {
        return current_user_can('manage_woocommerce');
    }

    public function get_settings() {
        return array(
            'success' => true,
            'data' => array(
                'api_url' => get_rest_url(null, 'wc/v3'),
                'consumer_key' => get_option('pos_consumer_key'),
                'consumer_secret' => get_option('pos_consumer_secret'),
            )
        );
    }

    public function add_admin_menu() {
        add_menu_page(
            'POS Settings',
            'POS System',
            'manage_woocommerce',
            'pos-settings',
            array($this, 'settings_page'),
            'dashicons-store',
            56
        );
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1>POS System Settings</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('pos_settings');
                do_settings_sections('pos_settings');
                ?>
                <table class="form-table">
                    <tr>
                        <th scope="row">Consumer Key</th>
                        <td>
                            <input type="text" name="pos_consumer_key" value="<?php echo esc_attr(get_option('pos_consumer_key')); ?>" class="regular-text">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Consumer Secret</th>
                        <td>
                            <input type="text" name="pos_consumer_secret" value="<?php echo esc_attr(get_option('pos_consumer_secret')); ?>" class="regular-text">
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function enqueue_admin_scripts($hook) {
        if ('toplevel_page_pos-settings' !== $hook) {
            return;
        }
        wp_enqueue_style('pos-admin-style', plugins_url('css/admin.css', __FILE__));
        wp_enqueue_script('pos-admin-script', plugins_url('js/admin.js', __FILE__), array('jquery'), '1.0.0', true);
    }
}

new POS_Integration();