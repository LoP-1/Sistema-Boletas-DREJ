<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('boletas', function (Blueprint $table) {
        $table->id();
        $table->string('archivo_origen')->nullable();
        $table->integer('raw_length')->nullable();
        $table->string('secuencia')->nullable();
        $table->string('codigo_encabezado')->nullable();
        $table->string('ruc_bloque')->nullable();
        $table->string('mes')->nullable();
        $table->string('anio')->nullable();
        $table->string('estado')->nullable();
        $table->string('establecimiento')->nullable();
        $table->string('cargo')->nullable();
        $table->string('tipo_servidor')->nullable();
        $table->string('tipo_pensionista')->nullable();
        $table->string('tipo_pension')->nullable();
        $table->string('nivel_mag_horas')->nullable();
        $table->string('tiempo_servicio')->nullable();
        $table->string('leyenda_permanente')->nullable();
        $table->string('leyenda_mensual')->nullable();
        $table->string('fecha_ingreso_registro')->nullable();
        $table->string('fecha_termino_registro')->nullable();
        $table->string('cuenta_principal')->nullable();
        $table->json('cuentas_todas')->nullable();
        $table->json('reg_pensionario_detalle')->nullable();
        $table->string('regimen_pensionario')->nullable();
        $table->double('total_remuneraciones')->nullable();
        $table->double('total_descuentos')->nullable();
        $table->double('total_liquido')->nullable();
        $table->double('monto_imponible')->nullable();
        $table->foreignId('persona_id')->nullable()->constrained('personas')->onDelete('cascade');
        $table->timestamps();
    });
}
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boletas');
    }
};
