# AI Model Yanıtı

Tarih: 2025-06-08T22:36:24.625Z
Trace ID: quiz-1749422170897-x6h3k
Yanıt Uzunluğu: 8980 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "KVM kurulumu için gerekli paketlerden hangisi, sanal makinelerin grafik arayüz üzerinden yönetilmesini sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "qemu-kvm",
        "virt-manager",
        "libvirt-daemon-system",
        "virtinst"
      ],
      "correctAnswer": "virt-manager",
      "explanation": "virt-manager paketi, KVM sanal makinelerini grafik arayüz üzerinden yönetmek için kullanılır. Diğer seçenekler KVM'nin temel kurulumu için gereklidir, ancak grafik arayüz yönetimini sağlamaz. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Kvm Kurulumu",
      "normalizedSubTopicName": "kvm_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdaki komutlardan hangisi, libvirtd servisinin durumunu kontrol etmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "sudo systemctl enable libvirtd",
        "sudo systemctl start libvirtd",
        "sudo systemctl status libvirtd",
        "sudo systemctl restart libvirtd.service"
      ],
      "correctAnswer": "sudo systemctl status libvirtd",
      "explanation": "sudo systemctl status libvirtd komutu, libvirtd servisinin o anki durumunu (çalışıyor, durmuş vb.) gösterir. Diğer komutlar servisi başlatma, yeniden başlatma veya otomatik başlatmayı etkinleştirme işlevlerine sahiptir. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Kvm Kurulumu",
      "normalizedSubTopicName": "kvm_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "KVM kurulumu sırasında gerekli olan paketleri kurmak için kullanılan komut aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt update",
        "sudo apt install -y qemu-kvm virt-manager",
        "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
        "sudo systemctl enable --now libvirtd"
      ],
      "correctAnswer": "sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils",
      "explanation": "Bu komut, KVM için gerekli olan tüm paketleri (qemu-kvm, virt-manager, libvirt-daemon-system, virtinst, libvirt-clients, bridge-utils) tek seferde kurar. Diğer seçenekler eksik paketler içerir veya farklı bir işlevi yerine getirir. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdakilerden hangisi KVM kurulumu için gerekli paketlerden biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "qemu-kvm",
        "virt-manager",
        "docker",
        "libvirt-daemon-system"
      ],
      "correctAnswer": "docker",
      "explanation": "Docker, container teknolojisi için kullanılan bir platformdur ve KVM kurulumu için gerekli değildir. qemu-kvm, virt-manager ve libvirt-daemon-system ise KVM kurulumu için gerekli paketlerdir. Bkz: 'Kvm kurulumu' bölümü.",
      "subTopicName": "Gerekli Paketlerin Kurulumu",
      "normalizedSubTopicName": "gerekli_paketlerin_kurulumu",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "/etc/libvirt/qemu.conf dosyasında yapılan değişiklikler hangi amaçla kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makine imajlarının konumunu değiştirmek",
        "Kullanıcı ve grup izinlerini ayarlamak",
        "Ağ ayarlarını yapılandırmak",
        "Sanal makine kaynaklarını sınırlandırmak"
      ],
      "correctAnswer": "Kullanıcı ve grup izinlerini ayarlamak",
      "explanation": "/etc/libvirt/qemu.conf dosyasında kullanıcı ve grup ayarlarındaki yorum satırını kaldırmak, libvirtd servisinin doğru kullanıcı ve grup izinleriyle çalışmasını sağlar. Bu, sanal makinelere erişim yetkilerini düzenlemek için önemlidir. Bkz: 'Aşağıdaki dosyada gerekli değişiklikler yapılır (gerekliyse)' bölümü.",
      "subTopicName": "Libvirtd Servisini Yapılandırma",
      "normalizedSubTopicName": "libvirtd_servisini_yapilandirma",
      "difficulty": "medium"
    },
    {
      "id": "q6",
      "questionText": "Libvirtd servisinin yapılandırma dosyasında (#user ve #group) yapılan değişikliklerin etkinleşmesi için hangi komutun çalıştırılması gerekir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt update",
        "sudo systemctl start libvirtd",
        "sudo systemctl restart libvirtd.service",
        "sudo usermod -aG kvm $USER"
      ],
      "correctAnswer": "sudo systemctl restart libvirtd.service",
      "explanation": "Yapılandırma dosyasında yapılan değişikliklerin etkinleşmesi için libvirtd servisinin yeniden başlatılması gerekir. Bu, sudo systemctl restart libvirtd.service komutu ile sağlanır. Bkz: 'Komut satırında aşağıdaki komut verilir' bölümü.",
      "subTopicName": "Libvirtd Servisini Yapılandırma",
      "normalizedSubTopicName": "libvirtd_servisini_yapilandirma",
      "difficulty": "easy"
    },
    {
      "id": "q7",
      "questionText": "Kullanıcının KVM ve libvirt gruplarına eklenmesinin amacı nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makine performansını artırmak",
        "Kullanıcının sanal makinelere erişim yetkisini sağlamak",
        "Ağ yapılandırmasını kolaylaştırmak",
        "Sistem güvenliğini artırmak"
      ],
      "correctAnswer": "Kullanıcının sanal makinelere erişim yetkisini sağlamak",
      "explanation": "Kullanıcının kvm ve libvirt gruplarına eklenmesi, kullanıcının sanal makinelere erişim ve yönetim yetkisine sahip olmasını sağlar. Bu, sanal makineleri oluşturma, başlatma, durdurma gibi işlemleri gerçekleştirebilmesi için gereklidir. Bkz: 'sudo usermod -aG kvm $USER' bölümü.",
      "subTopicName": "Kullanıcı İ Zinlerini Ayarlama",
      "normalizedSubTopicName": "kullanici_i_zinlerini_ayarlama",
      "difficulty": "medium"
    },
    {
      "id": "q8",
      "questionText": "Aşağıdaki komutlardan hangisi, mevcut kullanıcının KVM grubuna eklenmesini sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo apt install qemu-kvm",
        "sudo usermod -aG kvm $USER",
        "sudo systemctl restart libvirtd.service",
        "sudo virt-install"
      ],
      "correctAnswer": "sudo usermod -aG kvm $USER",
      "explanation": "sudo usermod -aG kvm $USER komutu, mevcut kullanıcıyı ( $USER ile belirtilir) kvm grubuna ekler. Bu, kullanıcının sanal makinelere erişim yetkisini kazanmasını sağlar. Bkz: 'sudo usermod -aG kvm $USER' bölümü.",
      "subTopicName": "Kullanıcı İ Zinlerini Ayarlama",
      "normalizedSubTopicName": "kullanici_i_zinlerini_ayarlama",
      "difficulty": "easy"
    },
    {
      "id": "q9",
      "questionText": "`virt-install` komutunda kullanılan `--disk path=/var/lib/libvirt/images/testVM.img,size=30` parametresi neyi ifade eder?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sanal makinenin kullanacağı işlemci sayısını",
        "Sanal makineye ayrılacak RAM miktarını",
        "Sanal makinenin disk imajının yolunu ve boyutunu",
        "Sanal makinenin ağ ayarlarını"
      ],
      "correctAnswer": "Sanal makinenin disk imajının yolunu ve boyutunu",
      "explanation": "Bu parametre, sanal makine için oluşturulacak disk imajının /var/lib/libvirt/images/ dizininde testVM.img adıyla oluşturulacağını ve boyutunun 30 GB olacağını belirtir. Bkz: 'VM kurulumu' bölümü.",
      "subTopicName": "Virt İnstallıkomutu İle Vm Oluşturma",
      "normalizedSubTopicName": "virt_installikkomutu_ile_vm_olusturma",
      "difficulty": "medium"
    },
    {
      "id": "q10",
      "questionText": "Aşağıdaki `virt-install` komut parametrelerinden hangisi, sanal makineye bir ISO dosyasını bağlamak için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "--name",
        "--cdrom",
        "--vcpu",
        "--ram"
      ],
      "correctAnswer": "--cdrom",
      "explanation": "--cdrom parametresi, sanal makineye bir ISO imaj dosyasını (örneğin, işletim sistemi kurulum imajı) bağlamak için kullanılır. Bu sayede sanal makine, bu ISO dosyasından boot edebilir. Bkz: 'VM kurulumu' bölümü.",
      "subTopicName": "Virt İnstallıkomutu İle Vm Oluşturma",
      "normalizedSubTopicName": "virt_installikkomutu_ile_vm_olusturma",
      "difficulty": "easy"
    }
  ]
}
```
```
