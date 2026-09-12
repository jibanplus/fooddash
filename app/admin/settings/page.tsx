'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Settings, CreditCard, QrCode, Save, Upload, 
  Check, X, AlertCircle, DollarSign, Globe, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { requireAuth, signOut } from '@/lib/auth';

export default function AdminSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('paytm');

  const [paytmConfig, setPaytmConfig] = useState({
    merchant_id: '',
    merchant_key: '',
    website_name: '',
    industry_type: 'Retail',
    channel_id: 'WEB',
    api_endpoint_staging: 'https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction',
    api_endpoint_production: 'https://securegw.paytm.in/theia/api/v1/initiateTransaction',
    callback_url: '',
    is_test_mode: true,
    is_enabled: false,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    min_order_amount: 0,
    max_order_amount: 100000,
    enable_cod: true,
    enable_upi: true,
    enable_wallet: false,
    tax_rate: 18,
    service_fee_rate: 5,
  });

  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrUploadDialog, setQrUploadDialog] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);

  useEffect(() => {
    checkAuth();
    fetchSettings();
  }, []);

  const checkAuth = async () => {
    try {
      await requireAuth('admin');
      setLoading(false);
    } catch (error) {
      router.push('/admin/login');
    }
  };

  const fetchSettings = async () => {
    try {
      const { data: paytmData } = await supabase
        .from('payment_settings')
        .select('*')
        .eq('provider', 'paytm')
        .single();

      if (paytmData) {
        setPaytmConfig({
          merchant_id: paytmData.merchant_id || '',
          merchant_key: paytmData.merchant_key || '',
          website_name: paytmData.website_name || '',
          industry_type: paytmData.industry_type || 'Retail',
          channel_id: paytmData.channel_id || 'WEB',
          api_endpoint_staging: paytmData.api_endpoint_staging || 'https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction',
          api_endpoint_production: paytmData.api_endpoint_production || 'https://securegw.paytm.in/theia/api/v1/initiateTransaction',
          callback_url: paytmData.callback_url || '',
          is_test_mode: paytmData.is_test_mode ?? true,
          is_enabled: paytmData.is_enabled ?? false,
        });
      }

      const { data: generalData } = await supabase
        .from('general_settings')
        .select('*')
        .single();

      if (generalData) {
        setPaymentSettings({
          min_order_amount: generalData.min_order_amount || 0,
          max_order_amount: generalData.max_order_amount || 100000,
          enable_cod: generalData.enable_cod ?? true,
          enable_upi: generalData.enable_upi ?? true,
          enable_wallet: generalData.enable_wallet ?? false,
          tax_rate: generalData.tax_rate || 18,
          service_fee_rate: generalData.service_fee_rate || 5,
        });
      }

      const { data: qrData } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('type', 'upi')
        .single();

      if (qrData && qrData.image_url) {
        setQrCode(qrData.image_url);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handlePaytmSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: upsertError } = await supabase
        .from('payment_settings')
        .upsert({
          provider: 'paytm',
          merchant_id: paytmConfig.merchant_id,
          merchant_key: paytmConfig.merchant_key,
          website_name: paytmConfig.website_name,
          industry_type: paytmConfig.industry_type,
          channel_id: paytmConfig.channel_id,
          api_endpoint_staging: paytmConfig.api_endpoint_staging,
          api_endpoint_production: paytmConfig.api_endpoint_production,
          callback_url: paytmConfig.callback_url,
          is_test_mode: paytmConfig.is_test_mode,
          is_enabled: paytmConfig.is_enabled,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'provider'
        });

      if (upsertError) throw upsertError;

      setSuccess('Paytm configuration saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save Paytm configuration');
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSettingsSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const { error: upsertError } = await supabase
        .from('general_settings')
        .upsert({
          id: 1,
          min_order_amount: paymentSettings.min_order_amount,
          max_order_amount: paymentSettings.max_order_amount,
          enable_cod: paymentSettings.enable_cod,
          enable_upi: paymentSettings.enable_upi,
          enable_wallet: paymentSettings.enable_wallet,
          tax_rate: paymentSettings.tax_rate,
          service_fee_rate: paymentSettings.service_fee_rate,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (upsertError) throw upsertError;

      setSuccess('Payment settings saved successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  };

  const handleQrUpload = async () => {
    if (!qrFile) {
      setError('Please select a QR code image');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // In a real implementation, you would upload to a storage service
      // For now, we'll use a local file reader
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        const { error: upsertError } = await supabase
          .from('qr_codes')
          .upsert({
            type: 'upi',
            image_url: base64String,
            is_active: true,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'type'
          });

        if (upsertError) throw upsertError;

        setQrCode(base64String);
        setSuccess('QR code uploaded successfully!');
        setQrUploadDialog(false);
        setQrFile(null);
        setSaving(false);
      };
      reader.readAsDataURL(qrFile);
    } catch (err: any) {
      setError(err.message || 'Failed to upload QR code');
      setSaving(false);
    }
  };

  const handleQrDelete = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('type', 'upi');

      if (error) throw error;

      setQrCode(null);
      setSuccess('QR code deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete QR code');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure payment gateway and platform settings</p>
        </div>
        <Button variant="outline" onClick={() => { signOut(); router.push('/'); }}>
          <Settings className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600 flex items-center gap-2">
          <Check className="h-4 w-4" />
          {success}
        </div>
      )}

      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="paytm">Paytm Configuration</TabsTrigger>
            <TabsTrigger value="payments">Payment Settings</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          {/* Paytm Configuration */}
          <TabsContent value="paytm" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Paytm API Configuration</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Enable Paytm</span>
                <Switch
                  checked={paytmConfig.is_enabled}
                  onCheckedChange={(checked) => setPaytmConfig({ ...paytmConfig, is_enabled: checked })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Merchant ID (MID)</label>
                <Input
                  value={paytmConfig.merchant_id}
                  onChange={(e) => setPaytmConfig({ ...paytmConfig, merchant_id: e.target.value })}
                  placeholder="YOUR_MERCHANT_ID"
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Merchant Key</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    value={paytmConfig.merchant_key}
                    onChange={(e) => setPaytmConfig({ ...paytmConfig, merchant_key: e.target.value })}
                    placeholder="YOUR_MERCHANT_KEY"
                    className="pl-10 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Website Name</label>
                <Input
                  value={paytmConfig.website_name}
                  onChange={(e) => setPaytmConfig({ ...paytmConfig, website_name: e.target.value })}
                  placeholder="WEBSTAGING"
                  className="font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Industry Type</label>
                <select
                  value={paytmConfig.industry_type}
                  onChange={(e) => setPaytmConfig({ ...paytmConfig, industry_type: e.target.value })}
                  className="w-full rounded-md border p-2"
                >
                  <option value="Retail">Retail</option>
                  <option value="Ecommerce">Ecommerce</option>
                  <option value="Education">Education</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Transport">Transport</option>
                  <option value="Utilities">Utilities</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Channel ID</label>
                <select
                  value={paytmConfig.channel_id}
                  onChange={(e) => setPaytmConfig({ ...paytmConfig, channel_id: e.target.value })}
                  className="w-full rounded-md border p-2"
                >
                  <option value="WEB">WEB</option>
                  <option value="WAP">WAP</option>
                  <option value="APP">APP</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Callback URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={paytmConfig.callback_url}
                    onChange={(e) => setPaytmConfig({ ...paytmConfig, callback_url: e.target.value })}
                    placeholder="https://yourdomain.com/api/payment/callback"
                    className="pl-10 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Staging API Endpoint</label>
                <Input
                  value={paytmConfig.api_endpoint_staging}
                  onChange={(e) => setPaytmConfig({ ...paytmConfig, api_endpoint_staging: e.target.value })}
                  placeholder="https://securegw-stage.paytm.in/theia/api/v1/initiateTransaction"
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Production API Endpoint</label>
                <Input
                  value={paytmConfig.api_endpoint_production}
                  onChange={(e) => setPaytmConfig({ ...paytmConfig, api_endpoint_production: e.target.value })}
                  placeholder="https://securegw.paytm.in/theia/api/v1/initiateTransaction"
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Switch
                checked={paytmConfig.is_test_mode}
                onCheckedChange={(checked) => setPaytmConfig({ ...paytmConfig, is_test_mode: checked })}
              />
              <span className="text-sm">Test Mode (Staging Environment)</span>
            </div>

            <div className="flex items-center gap-2 mt-4 bg-blue-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <p className="text-xs text-blue-600">
                Ensure your Merchant ID and Key are correct. Test mode uses staging environment.
              </p>
            </div>

            <Button onClick={handlePaytmSave} className="w-full bg-orange-500 hover:bg-orange-600" disabled={saving}>
              {saving ? 'Saving...' : 'Save Paytm Configuration'}
            </Button>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payments" className="mt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold">General Payment Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Minimum Order Amount (₹)</label>
                <Input
                  type="number"
                  value={paymentSettings.min_order_amount}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, min_order_amount: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Maximum Order Amount (₹)</label>
                <Input
                  type="number"
                  value={paymentSettings.max_order_amount}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, max_order_amount: Number(e.target.value) })}
                  placeholder="100000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tax Rate (%)</label>
                <Input
                  type="number"
                  value={paymentSettings.tax_rate}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, tax_rate: Number(e.target.value) })}
                  placeholder="18"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Service Fee Rate (%)</label>
                <Input
                  type="number"
                  value={paymentSettings.service_fee_rate}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, service_fee_rate: Number(e.target.value) })}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable Cash on Delivery (COD)</span>
                <Switch
                  checked={paymentSettings.enable_cod}
                  onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, enable_cod: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable UPI Payments</span>
                <Switch
                  checked={paymentSettings.enable_upi}
                  onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, enable_upi: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Enable Wallet Payments</span>
                <Switch
                  checked={paymentSettings.enable_wallet}
                  onCheckedChange={(checked) => setPaymentSettings({ ...paymentSettings, enable_wallet: checked })}
                />
              </div>
            </div>

            <Button onClick={handlePaymentSettingsSave} className="w-full bg-green-500 hover:bg-green-600" disabled={saving}>
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </Button>
          </TabsContent>

          {/* QR Code */}
          <TabsContent value="qr" className="mt-6 space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">UPI QR Code</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload your custom UPI QR code for manual/offline payments. Customers can scan this code to pay directly.
                </p>
                
                {qrCode ? (
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <img
                        src={qrCode}
                        alt="UPI QR Code"
                        className="w-full max-w-xs mx-auto"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setQrUploadDialog(true)}
                        className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" /> Update QR Code
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleQrDelete}
                        disabled={saving}
                      >
                        <X className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-muted-foreground mb-4">No QR code uploaded</p>
                    <Button onClick={() => setQrUploadDialog(true)} className="bg-purple-500 hover:bg-purple-600">
                      <Upload className="mr-2 h-4 w-4" /> Upload QR Code
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    Guidelines
                  </h4>
                  <ul className="text-xs text-blue-600 space-y-1">
                    <li>• Upload a clear, high-resolution QR code</li>
                    <li>• Ensure the QR code is scannable</li>
                    <li>• Recommended size: 300x300 pixels or larger</li>
                    <li>• Supported formats: PNG, JPG, JPEG</li>
                    <li>• Maximum file size: 5MB</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Benefits
                  </h4>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• Enable offline UPI payments</li>
                    <li>• Reduce dependency on payment gateways</li>
                    <li>• Lower transaction fees</li>
                    <li>• Instant payment confirmation</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* QR Upload Dialog */}
      <Dialog open={qrUploadDialog} onOpenChange={setQrUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload UPI QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your QR code here, or click to browse
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setQrFile(e.target.files?.[0] || null)}
                className="hidden"
                id="qr-upload"
              />
              <label htmlFor="qr-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Select File</span>
                </Button>
              </label>
              {qrFile && (
                <p className="mt-2 text-sm text-green-600">
                  Selected: {qrFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrUploadDialog(false)}>Cancel</Button>
            <Button onClick={handleQrUpload} className="bg-purple-500 hover:bg-purple-600" disabled={saving || !qrFile}>
              {saving ? 'Uploading...' : 'Upload QR Code'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}